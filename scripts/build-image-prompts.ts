import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "../lib/db";

const SYSTEM = `You are a food photography art director. Given a Hebrew recipe (title + ingredients + cooking method), write a 50-80 word English visual description of how the finished plated dish looks. Be SPECIFIC about color, texture, shape, plating style, garnishes, surface/background. Optimize for AI food photo generation. Always include "overhead shot" or "3/4 angle" and "natural daylight". No mention of people, hands, or text.

For Israeli/Middle Eastern dishes that may not be widely known internationally, transliterate the dish name and add a brief origin descriptor (e.g., "Yemenite slow-cooked pastry", "Iraqi-Jewish stew", "Sephardic semolina cake").

Respond with ONLY the description. No preamble, no quotes, no labels.`;

const CONCURRENCY = parseInt(process.env.CONCURRENCY ?? "8", 10);

type IngredientGroup = { groupName?: string; items: { name: string }[] };
type Step = { text: string; order?: number };

type RecipeRow = {
  id: string;
  title: string;
  subtitle: string | null;
  ingredients: unknown;
  steps: unknown;
};

async function buildPrompt(client: Anthropic, recipe: RecipeRow): Promise<string> {
  const ingGroups = (recipe.ingredients as IngredientGroup[]) ?? [];
  const ingredients = ingGroups
    .flatMap((g) => (g.items ?? []).map((i) => i.name))
    .filter(Boolean)
    .slice(0, 12)
    .join(", ");
  const stepArr = (recipe.steps as Step[]) ?? [];
  const firstSteps = stepArr
    .slice(0, 2)
    .map((s) => s.text)
    .join(" ");

  const userMsg = `Recipe title: ${recipe.title}
${recipe.subtitle ? `Subtitle: ${recipe.subtitle}\n` : ""}Key ingredients: ${ingredients}
Cooking method preview: ${firstSteps.slice(0, 300)}`;

  const r = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 250,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userMsg }],
  });

  const text = r.content.find((b) => b.type === "text");
  return text && "text" in text ? (text as { text: string }).text.trim() : "";
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      const e = err as { status?: number; message?: string };
      const status = e?.status;
      const msg = e?.message ?? String(err);
      const retryable =
        status === 429 ||
        status === 529 ||
        status === 503 ||
        status === 500 ||
        /429|529|rate|overloaded|unavailable|timeout/i.test(msg);
      if (retryable && attempt < 5) {
        const delay = 2000 * Math.pow(2, attempt);
        console.warn(`  retry ${attempt}/5 for ${label} in ${delay}ms (${msg.slice(0, 100)})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY missing");
    process.exit(1);
  }
  const limit = parseInt(process.argv[2] ?? "0", 10);
  const recipes = (await db.recipe.findMany({
    where: { status: "PUBLISHED", imagePrompt: null },
    select: { id: true, title: true, subtitle: true, ingredients: true, steps: true },
    orderBy: { createdAt: "asc" },
    take: limit > 0 ? limit : undefined,
  })) as RecipeRow[];

  console.log(`Building prompts for ${recipes.length} recipes (concurrency=${CONCURRENCY})`);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  let done = 0;
  let failed = 0;
  let nextIdx = 0;
  const startTime = Date.now();

  async function worker() {
    while (true) {
      const i = nextIdx++;
      if (i >= recipes.length) return;
      const r = recipes[i];
      try {
        const prompt = await withRetry(() => buildPrompt(client, r), r.title);
        if (!prompt) throw new Error("empty prompt");
        await db.recipe.update({ where: { id: r.id }, data: { imagePrompt: prompt } });
        done++;
      } catch (e: unknown) {
        failed++;
        const msg = (e as { message?: string })?.message ?? String(e);
        console.error(`FAIL ${r.title}: ${msg}`);
      }
      const total = done + failed;
      if (total % 25 === 0) {
        const elapsedMin = (Date.now() - startTime) / 60000;
        const rate = total / Math.max(elapsedMin, 0.01);
        const remainingMin = (recipes.length - total) / Math.max(rate, 0.01);
        console.log(
          `[${total}/${recipes.length}] done=${done} failed=${failed} rate=${rate.toFixed(1)}/min eta=${remainingMin.toFixed(1)}min`,
        );
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`\nDone. ${done} prompts built, ${failed} failed.`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});

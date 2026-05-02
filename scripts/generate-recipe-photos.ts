import "dotenv/config";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";
import { db } from "../lib/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_DIR = join(__dirname, "..", "public", "recipe-photos");
const CONCURRENCY = parseInt(process.env.CONCURRENCY ?? "3", 10);
const COST_PER_IMAGE = 0.04;
const COST_CAP = parseFloat(process.env.COST_CAP ?? "50");

const STYLE_MODIFIER =
  ". Photorealistic food photography, overhead view, natural daylight, restaurant-quality plating on rustic wooden or marble surface, shallow depth of field, no text, no people, no hands. High detail, appetizing.";

type RecipeRow = {
  id: string;
  slug: string;
  title: string;
  imagePrompt: string | null;
};

async function generateOne(
  ai: GoogleGenAI,
  recipe: RecipeRow,
): Promise<{ ok: boolean; cost: number; skipped?: boolean; err?: string }> {
  const outPath = join(OUTPUT_DIR, `${recipe.slug}.webp`);
  const publicPath = `/recipe-photos/${recipe.slug}.webp`;
  if (existsSync(outPath)) {
    try {
      await db.recipe.update({
        where: { id: recipe.id },
        data: { heroImage: publicPath },
      });
    } catch {
      // best effort
    }
    return { ok: true, cost: 0, skipped: true };
  }

  if (!recipe.imagePrompt) {
    return { ok: false, cost: 0, err: "missing imagePrompt — run build-image-prompts first" };
  }

  const prompt = `${recipe.imagePrompt}${STYLE_MODIFIER}`;

  let attempt = 0;
  while (attempt < 4) {
    try {
      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt,
        config: { numberOfImages: 1, aspectRatio: "4:3" },
      });
      const b64 = response.generatedImages?.[0]?.image?.imageBytes;
      if (!b64) throw new Error("no image returned");
      const png = Buffer.from(b64, "base64");
      const webp = await sharp(png)
        .resize({ width: 1000, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();
      writeFileSync(outPath, webp);
      await db.recipe.update({
        where: { id: recipe.id },
        data: { heroImage: publicPath },
      });
      return { ok: true, cost: COST_PER_IMAGE };
    } catch (err: unknown) {
      attempt++;
      const e = err as { status?: number; message?: string; code?: number };
      const status = e?.status ?? e?.code;
      const msg = e?.message ?? String(err);
      const isRateLimit =
        status === 429 ||
        status === 503 ||
        status === 500 ||
        /429|rate|quota|503|500|unavailable/i.test(msg);
      if (isRateLimit && attempt < 4) {
        const delay = 5000 * Math.pow(2, attempt);
        console.warn(`  retry ${attempt}/4 for ${recipe.slug} in ${delay}ms (${msg.slice(0, 100)})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return { ok: false, cost: 0, err: msg };
    }
  }
  return { ok: false, cost: 0, err: "max retries" };
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY missing");
    process.exit(1);
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const limit = parseInt(process.argv[2] ?? "0", 10);
  const startFrom = parseInt(process.env.START_FROM ?? "0", 10);

  const recipes = (await db.recipe.findMany({
    where: { status: "PUBLISHED", imagePrompt: { not: null } },
    select: { id: true, slug: true, title: true, imagePrompt: true },
    orderBy: { createdAt: "asc" },
    skip: startFrom,
    take: limit > 0 ? limit : undefined,
  })) as RecipeRow[];

  console.log(
    `Processing ${recipes.length} recipes (concurrency=${CONCURRENCY}, costCap=$${COST_CAP}, startFrom=${startFrom})`,
  );

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  let totalCost = 0;
  let done = 0;
  let failed = 0;
  let skipped = 0;
  let nextIdx = 0;
  const startTime = Date.now();

  async function worker(id: number) {
    while (true) {
      const i = nextIdx++;
      if (i >= recipes.length) return;
      if (totalCost >= COST_CAP) {
        console.error(`COST CAP hit ($${totalCost.toFixed(2)}), worker ${id} stopping`);
        return;
      }
      const r = recipes[i];
      const result = await generateOne(ai, r);
      if (result.skipped) {
        skipped++;
      } else if (result.ok) {
        done++;
        totalCost += result.cost;
      } else {
        failed++;
        console.error(`FAIL ${r.slug}: ${result.err}`);
      }
      const total = done + failed + skipped;
      if (total % 10 === 0) {
        const elapsedMin = (Date.now() - startTime) / 60000;
        const rate = total / Math.max(elapsedMin, 0.01);
        const remainingMin = (recipes.length - total) / Math.max(rate, 0.01);
        console.log(
          `[${total}/${recipes.length}] done=${done} skipped=${skipped} failed=${failed} ` +
            `spent=$${totalCost.toFixed(2)} ` +
            `rate=${rate.toFixed(1)}/min eta=${remainingMin.toFixed(0)}min`,
        );
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));

  console.log(
    `\nDone. ${done} generated, ${skipped} skipped, ${failed} failed. Total cost: $${totalCost.toFixed(2)}`,
  );
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});

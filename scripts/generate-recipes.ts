import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { db } from "../lib/db";
import {
  generateRecipeContent,
  checkVoiceCompliance,
  type Target,
} from "../lib/text-gen";
import {
  generateRecipeHero,
  generateRecipeStepImage,
} from "../lib/image-gen";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COST_CAP_USD = 400;
const PER_RECIPE_CAP_USD = 0.5;
const COST_PER_TEXT_GEN = 0.015;
const COST_PER_IMAGE = 0.04;
const SKIP_IMAGES = process.env.SKIP_IMAGES === "1" || !process.env.R2_ACCESS_KEY_ID;
const PLACEHOLDER_HERO = "/sapir/sapir-wide-kitchen.png";
const CONCURRENCY = parseInt(process.env.CONCURRENCY ?? "4", 10);

const FALLBACK_TARGETS: Target[] = [
  {
    title: "שקשוקה קלאסית",
    categorySlugs: ["israeli-everyday", "ten-minute"],
    tagHints: ["ארוחת בוקר", "צמחוני"],
  },
  {
    title: "חלה קלוית קלאסית",
    categorySlugs: ["baking", "yeast-doughs"],
    tagHints: ["ארוחת שישי"],
  },
  {
    title: "מחית בטטה לתינוקות",
    categorySlugs: ["for-kids", "babies-0-1"],
    tagHints: ["טבעוני"],
    ageRange: "6-12m",
  },
];

function readTargets(): Target[] {
  const path = join(__dirname, "recipe-targets.json");
  if (!existsSync(path)) {
    console.warn(
      `recipe-targets.json not found, using fallback test list (${FALLBACK_TARGETS.length})`,
    );
    return FALLBACK_TARGETS;
  }
  const file = JSON.parse(readFileSync(path, "utf-8"));
  if (!Array.isArray(file.targets) || file.targets.length === 0) {
    return FALLBACK_TARGETS;
  }
  return file.targets as Target[];
}

async function totalSpentSoFar(): Promise<number> {
  const result = await db.generationJob.aggregate({
    _sum: { costUsd: true },
    where: { status: "succeeded" },
  });
  return Number(result._sum.costUsd ?? 0);
}

function slugify(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^֐-׿a-z0-9\-]/gi, "")
    .toLowerCase();
}

async function alreadyGenerated(slug: string): Promise<boolean> {
  const existing = await db.recipe.findUnique({ where: { slug } });
  return !!existing;
}

async function generateOne(target: Target): Promise<void> {
  const candidateSlug = slugify(target.title);
  if (!candidateSlug) {
    console.log(`Skip (empty slug): ${target.title}`);
    return;
  }
  if (await alreadyGenerated(candidateSlug)) {
    console.log(`Skip (exists): ${target.title}`);
    return;
  }

  const job = await db.generationJob.create({
    data: { recipeSlug: candidateSlug, status: "running" },
  });

  let cost = 0;
  try {
    const content = await generateRecipeContent(target);
    cost += COST_PER_TEXT_GEN;

    const textsToCheck = [
      content.sapirIntro,
      ...(content.sapirTips ?? []),
      ...(content.steps as Array<{ text: string }>).map((s) => s.text),
    ];
    const issues = textsToCheck.flatMap((t) => checkVoiceCompliance(t));
    if (issues.length > 0) {
      console.warn(`  Voice issues for "${target.title}":`, issues);
    }

    let heroUrl = PLACEHOLDER_HERO;
    const stepImages: Record<number, string> = {};
    if (!SKIP_IMAGES) {
      heroUrl = await generateRecipeHero(content.title, content.sapirIntro);
      cost += COST_PER_IMAGE;
      const stepsToImage = (content.steps as Array<{ order: number; text: string }>).slice(0, 3);
      for (const s of stepsToImage) {
        if (cost + COST_PER_IMAGE > PER_RECIPE_CAP_USD) break;
        try {
          stepImages[s.order] = await generateRecipeStepImage(s.text, content.title);
          cost += COST_PER_IMAGE;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`  Step image failed for step ${s.order}: ${msg}`);
        }
      }
    }

    const stepsWithImages = (
      content.steps as Array<{ order: number; text: string; image?: string }>
    ).map((s) => ({
      ...s,
      ...(stepImages[s.order] ? { image: stepImages[s.order] } : {}),
    }));

    const finalSlug =
      content.slug && /^[a-z0-9\-֐-׿]+$/.test(content.slug)
        ? content.slug
        : candidateSlug;

    const categories = await db.category.findMany({
      where: { slug: { in: target.categorySlugs } },
    });

    await db.recipe.create({
      data: {
        slug: finalSlug,
        title: content.title,
        subtitle: content.subtitle ?? null,
        heroImage: heroUrl,
        galleryImages: [],
        sapirIntro: content.sapirIntro,
        prepTimeMin: content.prepTimeMin,
        cookTimeMin: content.cookTimeMin,
        totalTimeMin: content.totalTimeMin,
        servings: content.servings,
        difficulty: content.difficulty,
        ingredients: content.ingredients as never,
        steps: stepsWithImages as never,
        sapirTips: content.sapirTips ?? [],
        variations: (content.variations ?? []) as never,
        kosher: content.kosher,
        dietTags: content.dietTags ?? [],
        ageRange: target.ageRange ?? null,
        seoTitle: content.seoTitle,
        seoDescription: content.seoDescription,
        status: "DRAFT",
        categories: {
          create: categories.map((c) => ({ categoryId: c.id })),
        },
      },
    });

    await db.generationJob.update({
      where: { id: job.id },
      data: { status: "succeeded", costUsd: cost, finishedAt: new Date() },
    });
    console.log(`OK ${target.title} ($${cost.toFixed(2)})`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await db.generationJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        errorMsg: msg.slice(0, 500),
        finishedAt: new Date(),
      },
    });
    console.error(`FAIL ${target.title}: ${msg}`);
  }
}

async function main() {
  const argLimit = parseInt(process.argv[2] ?? "0", 10);
  const targets = readTargets();
  const limit = argLimit > 0 ? Math.min(argLimit, targets.length) : targets.length;

  console.log(`Processing ${limit} of ${targets.length} targets (concurrency=${CONCURRENCY}, skip-images=${SKIP_IMAGES})...`);

  let processed = 0;
  let nextIndex = 0;

  async function worker(workerId: number) {
    while (true) {
      const i = nextIndex++;
      if (i >= limit) return;
      const spent = await totalSpentSoFar();
      if (spent >= COST_CAP_USD) {
        console.error(`Cost cap hit ($${spent.toFixed(2)}). Worker ${workerId} stopping.`);
        return;
      }
      try {
        await generateOne(targets[i]);
      } catch (err) {
        console.error(`Worker ${workerId} unhandled:`, err);
      }
      processed++;
      if (processed % 20 === 0) {
        const s = await totalSpentSoFar();
        console.log(`[${processed}/${limit}] cumulative spent: $${s.toFixed(2)}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));

  await db.$disconnect();
  console.log(`Done. Processed ${processed} recipes.`);
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});

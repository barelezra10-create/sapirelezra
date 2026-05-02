import Anthropic from "@anthropic-ai/sdk";
import { SAPIR_SYSTEM_PROMPT } from "./sapir-prompt";
import { recipeInputSchema } from "./recipe-schema";

let cachedClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (!cachedClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not set");
    }
    cachedClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return cachedClient;
}

const recipeToolInputSchema = {
  type: "object" as const,
  properties: {
    slug: { type: "string" },
    title: { type: "string" },
    subtitle: { type: "string" },
    sapirIntro: { type: "string" },
    prepTimeMin: { type: "integer" },
    cookTimeMin: { type: "integer" },
    totalTimeMin: { type: "integer" },
    servings: { type: "integer" },
    difficulty: { type: "string", enum: ["EASY", "MEDIUM", "HARD"] },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          groupName: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                quantity: { type: "string" },
                unit: { type: "string" },
                note: { type: "string" },
              },
              required: ["name"],
            },
          },
        },
        required: ["items"],
      },
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          order: { type: "integer" },
          text: { type: "string" },
        },
        required: ["order", "text"],
      },
    },
    sapirTips: { type: "array", items: { type: "string" } },
    variations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["title", "description"],
      },
    },
    kosher: {
      type: "string",
      enum: ["DAIRY", "MEAT", "PAREVE", "NOT_KOSHER"],
    },
    dietTags: { type: "array", items: { type: "string" } },
    seoTitle: { type: "string" },
    seoDescription: { type: "string" },
  },
  required: [
    "slug",
    "title",
    "sapirIntro",
    "prepTimeMin",
    "cookTimeMin",
    "totalTimeMin",
    "servings",
    "difficulty",
    "ingredients",
    "steps",
    "kosher",
    "seoTitle",
    "seoDescription",
  ],
};

export type Target = {
  title: string;
  categorySlugs: string[];
  tagHints: string[];
  ageRange?: string;
};

export type GeneratedRecipe = {
  slug: string;
  title: string;
  subtitle?: string;
  sapirIntro: string;
  prepTimeMin: number;
  cookTimeMin: number;
  totalTimeMin: number;
  servings: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  ingredients: unknown[];
  steps: unknown[];
  sapirTips: string[];
  variations: unknown[];
  kosher: "DAIRY" | "MEAT" | "PAREVE" | "NOT_KOSHER";
  dietTags: string[];
  seoTitle: string;
  seoDescription: string;
};

export async function generateRecipeContent(
  target: Target,
): Promise<GeneratedRecipe> {
  const userPrompt = `כתבי מתכון מלא ל"${target.title}". קטגוריות: ${target.categorySlugs.join(
    ", ",
  )}. רמזים: ${target.tagHints.join(", ") || "אין"}.${
    target.ageRange ? ` טווח גילאים: ${target.ageRange}.` : ""
  }`;

  const client = getClient();
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: [
      {
        type: "text",
        text: SAPIR_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      {
        name: "record_recipe",
        description:
          "Record a complete recipe with all required fields in Hebrew, following Sapir's voice.",
        input_schema: recipeToolInputSchema,
      },
    ],
    tool_choice: { type: "tool", name: "record_recipe" },
    messages: [{ role: "user", content: userPrompt }],
  });

  const toolUseBlock = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!toolUseBlock) {
    throw new Error("No tool_use block in Claude response");
  }
  const raw = toolUseBlock.input as GeneratedRecipe;

  // Light Zod-friendly validation: re-use the recipe input schema's subset.
  // Fill placeholder values for image fields and category links so the schema
  // validates the generated subset cleanly.
  const validation = {
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle ?? null,
    heroImage: "https://placeholder.invalid/hero.jpg",
    galleryImages: [],
    sapirIntro: raw.sapirIntro,
    prepTimeMin: raw.prepTimeMin,
    cookTimeMin: raw.cookTimeMin,
    totalTimeMin: raw.totalTimeMin,
    servings: raw.servings,
    difficulty: raw.difficulty,
    ingredients: raw.ingredients,
    steps: raw.steps,
    sapirTips: raw.sapirTips ?? [],
    variations: raw.variations ?? [],
    kosher: raw.kosher,
    dietTags: raw.dietTags ?? [],
    ageRange: target.ageRange ?? null,
    seoTitle: raw.seoTitle,
    seoDescription: raw.seoDescription,
    status: "DRAFT" as const,
    categoryIds: [],
    tagIds: [],
  };
  recipeInputSchema.parse(validation);
  return raw;
}

const BANNED_WORDS = ["ראויה", "מתוחכמת", "מעודנת", "מהפנט", "נסיכותי"];

export function checkVoiceCompliance(text: string): string[] {
  const issues: string[] = [];
  if (text.includes("—") || text.includes("–")) issues.push("contains em/en dash");
  for (const w of BANNED_WORDS) {
    if (text.includes(w)) issues.push(`contains banned word: ${w}`);
  }
  return issues;
}

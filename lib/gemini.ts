import { GoogleGenAI, Type } from "@google/genai";
import { SAPIR_SYSTEM_PROMPT } from "./sapir-prompt";
import { recipeInputSchema } from "./recipe-schema";

let cachedAi: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!cachedAi) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
    cachedAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return cachedAi;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    slug: { type: Type.STRING },
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    sapirIntro: { type: Type.STRING },
    prepTimeMin: { type: Type.INTEGER },
    cookTimeMin: { type: Type.INTEGER },
    totalTimeMin: { type: Type.INTEGER },
    servings: { type: Type.INTEGER },
    difficulty: { type: Type.STRING, enum: ["EASY", "MEDIUM", "HARD"] },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          groupName: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.STRING },
                unit: { type: Type.STRING },
                note: { type: Type.STRING },
              },
              required: ["name"],
            },
          },
        },
        required: ["items"],
      },
    },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          order: { type: Type.INTEGER },
          text: { type: Type.STRING },
        },
        required: ["order", "text"],
      },
    },
    sapirTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    variations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["title", "description"],
      },
    },
    kosher: { type: Type.STRING, enum: ["DAIRY", "MEAT", "PAREVE", "NOT_KOSHER"] },
    dietTags: { type: Type.ARRAY, items: { type: Type.STRING } },
    seoTitle: { type: Type.STRING },
    seoDescription: { type: Type.STRING },
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

export async function generateRecipeContent(target: Target): Promise<GeneratedRecipe> {
  const userPrompt = `כתבי מתכון מלא ל"${target.title}". קטגוריות: ${target.categorySlugs.join(
    ", "
  )}. רמזים: ${target.tagHints.join(", ") || "אין"}.${
    target.ageRange ? ` טווח גילאים: ${target.ageRange}.` : ""
  }`;

  const ai = getAi();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: SAPIR_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: responseSchema as any,
      temperature: 0.7,
    },
  });

  const text = response.text ?? "";
  const cleaned = text.replace(/```json\n?|```/g, "").trim();
  const raw = JSON.parse(cleaned) as GeneratedRecipe;

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

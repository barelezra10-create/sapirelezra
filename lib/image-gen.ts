import { GoogleGenAI } from "@google/genai";
import { uploadImage } from "./r2";

let cachedAi: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!cachedAi) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");
    cachedAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return cachedAi;
}

const STYLE_MODIFIERS =
  "editorial cookbook photography, warm overhead lighting, on parchment-textured surface, shallow depth of field, natural daylight, no text, no people, no hands";

const NEGATIVE =
  "people, hands, text, logos, watermarks, garish colors, cartoon, illustration";

async function generateImageBytes(
  prompt: string,
  aspectRatio: "16:9" | "1:1" | "4:3" = "16:9"
): Promise<Buffer> {
  const ai = getAi();
  const response = await ai.models.generateImages({
    model: "imagen-4.0-generate-001",
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio,
      negativePrompt: NEGATIVE,
    },
  });

  const generated = response.generatedImages;
  if (!generated || generated.length === 0) {
    throw new Error("No images returned by Imagen");
  }
  const base64 = generated[0]?.image?.imageBytes;
  if (!base64) {
    throw new Error("No imageBytes in Imagen response");
  }
  return Buffer.from(base64, "base64");
}

export async function generateRecipeHero(
  recipeTitle: string,
  recipeDescription: string
): Promise<string> {
  const prompt = `${recipeTitle}. ${recipeDescription}. ${STYLE_MODIFIERS}. Wide landscape composition, food centered, plate or bowl on rustic surface.`;
  const buffer = await generateImageBytes(prompt, "16:9");
  return uploadImage(buffer, "image/jpeg", "recipes/hero");
}

export async function generateRecipeStepImage(
  stepText: string,
  recipeTitle: string
): Promise<string> {
  const prompt = `Step from recipe "${recipeTitle}": ${stepText}. ${STYLE_MODIFIERS}. Action shot of the cooking step, close-up of food or cookware on parchment-textured surface.`;
  const buffer = await generateImageBytes(prompt, "16:9");
  return uploadImage(buffer, "image/jpeg", "recipes/steps");
}

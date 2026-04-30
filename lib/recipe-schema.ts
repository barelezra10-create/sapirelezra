import { z } from "zod";

export const ingredientItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  note: z.string().optional(),
});

export const ingredientGroupSchema = z.object({
  groupName: z.string().optional(),
  items: z.array(ingredientItemSchema).min(1),
});

export const stepSchema = z.object({
  order: z.number().int().nonnegative(),
  text: z.string().min(1),
  image: z.string().url().optional(),
});

export const variationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const recipeInputSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9\-֐-׿]+$/, "slug must be lowercase alphanumeric or Hebrew"),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional().nullable(),
  heroImage: z.string().url(),
  galleryImages: z.array(z.string().url()).default([]),
  sapirIntro: z.string().min(20).max(800),
  prepTimeMin: z.number().int().min(0),
  cookTimeMin: z.number().int().min(0),
  totalTimeMin: z.number().int().min(0),
  servings: z.number().int().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  ingredients: z.array(ingredientGroupSchema).min(1),
  steps: z.array(stepSchema).min(1),
  sapirTips: z.array(z.string()).default([]),
  variations: z.array(variationSchema).default([]),
  kosher: z.enum(["DAIRY", "MEAT", "PAREVE", "NOT_KOSHER"]),
  dietTags: z.array(z.string()).default([]),
  ageRange: z.string().optional().nullable(),
  seoTitle: z.string().min(1).max(70),
  seoDescription: z.string().min(1).max(160),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  categoryIds: z.array(z.string()).default([]),
  tagIds: z.array(z.string()).default([]),
});

export type RecipeInput = z.infer<typeof recipeInputSchema>;

import { describe, it, expect } from "vitest";
import { recipeInputSchema } from "../recipe-schema";

const valid = {
  slug: "shakshuka-קלאסית",
  title: "שקשוקה קלאסית",
  heroImage: "https://example.com/hero.jpg",
  galleryImages: [],
  sapirIntro: "השקשוקה הזו לקחתי מהדודה שלי בקזבלנקה. סוד הטעם הוא להמתין שהבצל יזהיב באמת.",
  prepTimeMin: 10,
  cookTimeMin: 20,
  totalTimeMin: 30,
  servings: 4,
  difficulty: "EASY",
  ingredients: [{ items: [{ name: "עגבניות", quantity: "5", unit: "יח'" }] }],
  steps: [{ order: 1, text: "לחתוך את הבצל" }],
  sapirTips: [],
  variations: [],
  kosher: "PAREVE",
  dietTags: [],
  seoTitle: "שקשוקה קלאסית | ספיר אלעזרא",
  seoDescription: "המתכון הקלאסי שלי לשקשוקה ברוטב עגבניות עשיר.",
  status: "DRAFT",
  categoryIds: [],
  tagIds: [],
};

describe("recipeInputSchema", () => {
  it("accepts valid recipe", () => {
    expect(() => recipeInputSchema.parse(valid)).not.toThrow();
  });
  it("rejects empty ingredients", () => {
    expect(() => recipeInputSchema.parse({ ...valid, ingredients: [] })).toThrow();
  });
  it("rejects sapirIntro shorter than 20 chars", () => {
    expect(() => recipeInputSchema.parse({ ...valid, sapirIntro: "קצר מדי" })).toThrow();
  });
  it("accepts Hebrew slugs", () => {
    expect(() => recipeInputSchema.parse({ ...valid, slug: "שקשוקה-קלאסית" })).not.toThrow();
  });
});

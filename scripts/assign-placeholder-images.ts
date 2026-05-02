import "dotenv/config";
import { db } from "../lib/db";

// Curated Unsplash food photos. Each entry maps a category-slug hint to a
// pool of 6-10 specific Unsplash IDs that look editorial and match the cuisine.
// Recipes get assigned an image based on (primary category, slug-hash) so
// the same recipe always gets the same image and recipes within a category
// get distributed across the pool.

const CATEGORY_POOLS: Record<string, string[]> = {
  // for-kids — light, colorful, baby food, kid-friendly
  "for-kids": [
    "1547573854-74d2a71d0826",
    "1618174149317-e6e87b4ff7ce",
    "1626844131082-256783844137",
    "1547928576-b822bc410bdf",
    "1565299543923-37dd37887442",
    "1490645935967-10de6ba17061",
    "1599785209707-a456fc1337bb",
    "1574484284002-952d92456975",
  ],
  // baking — bread, cake, pastries
  baking: [
    "1568471173242-461f0a730452",
    "1606313564200-e75d5e30476c",
    "1509440159596-0249088772ff",
    "1486427944299-d1955d23e34d",
    "1575224526-e75c14eba8c4",
    "1619994403073-2cec844b8e63",
    "1571115764595-644a1f56a55c",
    "1587049352846-4a222e784d38",
    "1574087631321-5f9df74dc7e5",
    "1483695028939-5bb13f8648b0",
  ],
  // grandma cuisines — Moroccan, Tripolitan, Persian, etc.
  "grandma-cuisines": [
    "1547928576-b822bc410bdf",
    "1604920265583-eecf3a4a35e7",
    "1590412200988-a436970781fa",
    "1574484284002-952d92456975",
    "1604908176997-125f25cc6f3d",
    "1603894584373-5ac82b2ae398",
    "1546548970-71785318a17b",
    "1505253716362-afaea1d3d1af",
  ],
  // world cuisines — French, Japanese, Italian, Thai
  "world-cuisines": [
    "1551183053-bf91a1d81141",
    "1579871494447-9811cf80d66c",
    "1565299624946-b28f40a0ae38",
    "1606313564200-e75d5e30476c",
    "1574071318508-1cdbab80d002",
    "1567620905732-2d1ec7ab7445",
    "1572441714898-d0fac1c6ba9e",
    "1569718212165-3a8278d5f624",
    "1551782450-a2132b4ba21d",
  ],
  // israeli everyday — shakshuka, friday dinner, holiday
  "israeli-everyday": [
    "1590412200988-a436970781fa",
    "1568471173242-461f0a730452",
    "1604908554007-19a0d59cf2d8",
    "1610632380989-680fe40816c6",
    "1605333396915-47ed6b58a3a3",
    "1568471173242-461f0a730452",
    "1612459284970-e8f027596582",
    "1574087631321-5f9df74dc7e5",
  ],
  // by-diet — vegan, gluten-free, healthy, fresh
  "by-diet": [
    "1490645935967-10de6ba17061",
    "1543339494-b4cd4c95c5f4",
    "1505253716362-afaea1d3d1af",
    "1571877227200-a0d98ea607e9",
    "1505576399279-565b52d4ac71",
    "1495521821757-a1efb6729352",
    "1502301197179-65228ab57f78",
    "1565299624946-b28f40a0ae38",
  ],
};

// Generic fallback pool for recipes that don't match any category
const FALLBACK_POOL = [
  "1605333396915-47ed6b58a3a3",
  "1490645935967-10de6ba17061",
  "1571115764595-644a1f56a55c",
  "1505253716362-afaea1d3d1af",
];

const PLACEHOLDER_HERO = "/sapir/sapir-wide-kitchen.png";

function buildUnsplashUrl(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1600&q=80`;
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickImageForRecipe(slug: string, categorySlugs: string[]): string {
  // Find the first matching pool by walking up: sub-category -> top-category -> fallback
  for (const cs of categorySlugs) {
    if (CATEGORY_POOLS[cs]) {
      const pool = CATEGORY_POOLS[cs];
      const idx = hashString(slug) % pool.length;
      return buildUnsplashUrl(pool[idx]);
    }
  }
  const idx = hashString(slug) % FALLBACK_POOL.length;
  return buildUnsplashUrl(FALLBACK_POOL[idx]);
}

async function main() {
  const recipes = await db.recipe.findMany({
    where: { heroImage: PLACEHOLDER_HERO },
    select: {
      id: true,
      slug: true,
      categories: {
        select: { category: { select: { slug: true, parent: { select: { slug: true } } } } },
      },
    },
  });

  console.log(`Found ${recipes.length} recipes with placeholder image`);

  let updated = 0;
  for (const r of recipes) {
    // Build category slug list including parent slugs (so we can look up "baking" from "breads")
    const slugs: string[] = [];
    for (const c of r.categories) {
      slugs.push(c.category.slug);
      if (c.category.parent) slugs.push(c.category.parent.slug);
    }
    const newImage = pickImageForRecipe(r.slug, slugs);
    await db.recipe.update({
      where: { id: r.id },
      data: { heroImage: newImage },
    });
    updated++;
    if (updated % 50 === 0) console.log(`  updated ${updated}/${recipes.length}`);
  }

  console.log(`Done. Updated ${updated} recipes.`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

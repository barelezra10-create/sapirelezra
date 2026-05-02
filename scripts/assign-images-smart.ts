import "dotenv/config";
import { db } from "../lib/db";

/**
 * Smart image assignment based on dish-type detection from the title.
 *
 * Detects dish-type keywords in priority order (most specific first), then
 * picks a hash-stable Unsplash photo from the matching pool. Falls back to
 * category-based pools, then to a generic savory/sweet default.
 */

// ----------------------------------------------------------------------------
// POOLS (Unsplash photo IDs — verified at run time, bad ones get pruned).
// ----------------------------------------------------------------------------

const POOLS: Record<string, string[]> = {
  purees: [
    "1547573854-74d2a71d0826",
    "1618174149317-e6e87b4ff7ce",
    "1565299543923-37dd37887442",
    "1606756792158-0a39bdebcdce",
  ],
  toddlerFingerFood: [
    "1547928576-b822bc410bdf",
    "1565958011703-44f9829ba187",
    "1599785209707-a456fc1337bb",
    "1604908176997-125f25cc6f3d",
    "1574484284002-952d92456975",
  ],
  pasta: [
    "1551183053-bf91a1d81141",
    "1473093295043-cdd812d0e601",
    "1600028068383-ea11a7a101f3",
    "1612874742237-6526221588e3",
    "1621996346565-e3dbc646d9a9",
    "1572441714898-d0fac1c6ba9e",
  ],
  rice: [
    "1574071318508-1cdbab80d002",
    "1596797038530-2c107229654b",
    "1591105327764-2f4ed7e02619",
    "1564834724105-918b73d1b9e0",
  ],
  pizza: [
    "1604068549290-dea0e4a305ca",
    "1571997478779-2adcbbe9ab2f",
    "1574071318508-1cdbab80d002",
  ],
  baked: [
    "1568901346375-23c9450c58cd",
    "1547573854-74d2a71d0826",
    "1574484284002-952d92456975",
    "1564834724105-918b73d1b9e0",
    "1604920265583-eecf3a4a35e7",
  ],
  bread: [
    "1568471173242-461f0a730452",
    "1509440159596-0249088772ff",
    "1486427944299-d1955d23e34d",
    "1549931319-a545dcf3bc73",
    "1574087631321-5f9df74dc7e5",
  ],
  soup: [
    "1604908554049-9c35d59df745",
    "1603105037880-880cd4edfb0d",
    "1547592180-85f173990554",
    "1605523062-32fff8e6c2d6",
  ],
  salad: [
    "1490645935967-10de6ba17061",
    "1505253716362-afaea1d3d1af",
    "1607532941433-304659e8198a",
    "1543339494-b4cd4c95c5f4",
    "1571877227200-a0d98ea607e9",
  ],
  cake: [
    "1606313564200-e75d5e30476c",
    "1565958011703-44f9829ba187",
    "1571115764595-644a1f56a55c",
    "1488477181946-6428a0291777",
    "1483695028939-5bb13f8648b0",
  ],
  cookies: [
    "1499636136210-6f4ee915583e",
    "1490835915207-dad1f8e89e4f",
    "1568051243858-533a607809a5",
    "1587049352846-4a222e784d38",
  ],
  pastry: [
    "1568471173242-461f0a730452",
    "1571115764595-644a1f56a55c",
    "1601379760883-1bb0c7b06c20",
    "1619994403073-2cec844b8e63",
  ],
  stew: [
    "1547928576-b822bc410bdf",
    "1604920265583-eecf3a4a35e7",
    "1604908554049-9c35d59df745",
    "1603894584373-5ac82b2ae398",
  ],
  meatballs: [
    "1626844131082-256783844137",
    "1565958011703-44f9829ba187",
    "1604908176997-125f25cc6f3d",
  ],
  fish: [
    "1599487488170-d11ec9c172f0",
    "1535007813616-79dc02ba4021",
    "1565299507177-b0ac66763828",
  ],
  chicken: [
    "1604908176997-125f25cc6f3d",
    "1626844131082-256783844137",
    "1598103442097-8b74394b95c6",
  ],
  eggs: [
    "1590412200988-a436970781fa",
    "1525351484163-7529414344d8",
    "1604908554007-19a0d59cf2d8",
  ],
  sushi: [
    "1579871494447-9811cf80d66c",
    "1553621042-f6e147245754",
    "1611143669185-af224c5e3252",
  ],
  stirfry: [
    "1559847844-5315695dadae",
    "1606756792158-0a39bdebcdce",
    "1567620905732-2d1ec7ab7445",
  ],
  dessert: [
    "1606313564200-e75d5e30476c",
    "1488477181946-6428a0291777",
    "1565958011703-44f9829ba187",
    "1551782450-a2132b4ba21d",
  ],
  drink: [
    "1505252585461-04db1eb84625",
    "1572441714898-d0fac1c6ba9e",
    "1502301197179-65228ab57f78",
  ],
  defaultMeat: [
    "1604908176997-125f25cc6f3d",
    "1626844131082-256783844137",
    "1546548970-71785318a17b",
  ],
  defaultVegetable: [
    "1490645935967-10de6ba17061",
    "1505253716362-afaea1d3d1af",
    "1571877227200-a0d98ea607e9",
    "1502301197179-65228ab57f78",
  ],
  defaultSavory: [
    "1604908554049-9c35d59df745",
    "1612459284970-e8f027596582",
    "1546548970-71785318a17b",
    "1604908176997-125f25cc6f3d",
  ],
  defaultSweet: [
    "1606313564200-e75d5e30476c",
    "1488477181946-6428a0291777",
    "1565958011703-44f9829ba187",
  ],
};

type PoolKey = keyof typeof POOLS;

// ----------------------------------------------------------------------------
// DETECTION RULES — checked in order. First match wins.
// Each rule: { pool, anyOf?: string[], allOf?: string[][] }
// `anyOf` matches if any keyword present in title.
// `allOf` matches if every group has at least one keyword present (AND of ORs).
// ----------------------------------------------------------------------------

type Rule =
  | { pool: PoolKey; anyOf: string[] }
  | { pool: PoolKey; allOf: string[][] };

const RULES: Rule[] = [
  // 1. Babies / purees / first foods (most specific)
  {
    pool: "purees",
    anyOf: ["מחית", "מחיות", "פירה גזר", "פירה בטטה", "אוכל ראשון"],
  },
  // 2. Sushi
  { pool: "sushi", anyOf: ["סושי", "מאקי", "ניגירי", "סשימי"] },
  // 3. Pizza / focaccia
  { pool: "pizza", anyOf: ["פיצה", "פוקצ'ה", "פוקאצ'ה", "קלצונה"] },
  // 3b. Baked layered/casserole dishes (gratin, casserole, mille-feuille savory, lasagna-like)
  { pool: "baked", anyOf: ["גרטן", "קסרול", "מילופי", "מוסקה", "אנצ'ילדה", "פאי בשר", "פאי עוף", "פאי דגים", "אפויה בתנור", "מאפה ירקות", "מאפה גבינה"] },
  // 4. Pasta
  {
    pool: "pasta",
    anyOf: ["פסטה", "ספגטי", "פנה", "לזניה", "ניוקי", "פטוצ'יני", "טליאטלה", "קנלוני", "רביולי", "טורטליני"],
  },
  // 5. Rice / risotto
  { pool: "rice", anyOf: ["אורז", "ריזוטו", "פילאף", "ביריאני", "מג'דרה", "מקלובה"] },
  // 6. Stir-fry / wok
  { pool: "stirfry", anyOf: ["מוקפץ", "מוקפצים", "ווק", "פאד תאי", "צ'או מיין"] },
  // 7. Eggs / shakshuka / omelette
  { pool: "eggs", anyOf: ["שקשוקה", "חביתה", "אומלט", "ביצים", "ביצה עלומה", "פריטטה", "קישה"] },
  // 8. Soup / broth
  { pool: "soup", anyOf: ["מרק", "ציר", "קרם של"] },
  // 9. Salad
  { pool: "salad", anyOf: ["סלט", "סלטי"] },
  // 10. Stew / tagine / cholent
  { pool: "stew", anyOf: ["טאז'ין", "תבשיל", "חמין", "אסאדו", "גולש", "צלי", "אוסובוקו", "ראגו"] },
  // 11. Meatballs / burgers / kebab
  {
    pool: "meatballs",
    anyOf: ["קציצות", "קציצה", "המבורגר", "מיטבולס", "קבב", "כדורי בשר", "פולפטה"],
  },
  // 12. Fish / seafood
  {
    pool: "fish",
    anyOf: ["דג", "דגים", "סלמון", "טונה", "בורי", "מושט", "לברק", "פילה דג", "אמנון", "סינטה", "שרימפ", "גמבה", "קלמרי"],
  },
  // 13. Chicken
  {
    pool: "chicken",
    anyOf: ["עוף", "כנפי", "פרגית", "שניצל", "חזה עוף", "כרעיים", "פרגיות"],
  },
  // 14. Drinks
  { pool: "drink", anyOf: ["שייק", "מילקשייק", "קוקטייל", "סמודי", "לימונדה", "משקה"] },
  // 15. Cookies / muffins / energy balls
  {
    pool: "cookies",
    anyOf: ["עוגיות", "עוגייה", "מאפינס", "מאפין", "כדורי שוקולד", "ביסקוטי", "מקרון", "מקרונים"],
  },
  // 16. Cake / tart / pie (sweet)
  {
    pool: "cake",
    anyOf: ["עוגת", "עוגה", "טארט", "פאי", "צ'יזקייק", "באבקה", "בראוניז", "פבלובה"],
  },
  // 17. Savory pastries
  {
    pool: "pastry",
    anyOf: ["בורקס", "סמבוסק", "כיסוני", "כיסון", "מלאווח", "ג'חנון", "סיגרים"],
  },
  // 18. Bread / challah
  {
    pool: "bread",
    anyOf: ["לחם", "חלה", "פיתה", "בריוש", "בייגל", "באגט", "פוקסיה", "לחמניות"],
  },
  // 19. Plated dessert
  {
    pool: "dessert",
    anyOf: ["מוס", "פנקייק", "פנקייקס", "קרם", "קרמל", "פרלינה", "טרילצ'ה", "טירמיסו", "קרפים", "קרפ", "פאנה קוטה", "סופלה"],
  },
];

// Toddler/finger-food keywords — only kicks in when ageRange suggests young child.
const TODDLER_AGE = new Set(["1-3", "0-1", "6m", "1-5", "3-5", "12m", "12-24m"]);
const TODDLER_FINGER = ["אצבעות", "אצבעיות", "כדורי", "מקלוני", "נשנושי", "ביס"];

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------

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

function pickFromPool(slug: string, pool: string[]): string {
  if (pool.length === 0) return "";
  const idx = hashString(slug) % pool.length;
  return buildUnsplashUrl(pool[idx]);
}

function ruleMatches(rule: Rule, title: string): boolean {
  if ("anyOf" in rule) {
    return rule.anyOf.some((kw) => title.includes(kw));
  }
  return rule.allOf.every((group) => group.some((kw) => title.includes(kw)));
}

function detectPool(opts: {
  title: string;
  subtitle: string | null;
  categorySlugs: string[];
  ageRange: string | null;
  dietTags: string[];
}): PoolKey {
  const haystack = `${opts.title} ${opts.subtitle ?? ""}`;

  // Toddler finger-food: needs both age signal AND finger-food keyword OR for-kids category + finger-food keyword.
  const isYoungChild =
    (opts.ageRange && TODDLER_AGE.has(opts.ageRange)) ||
    opts.categorySlugs.includes("for-kids");
  if (isYoungChild && TODDLER_FINGER.some((kw) => haystack.includes(kw))) {
    return "toddlerFingerFood";
  }

  // Babies puree (also matches puree-keywords + baby age)
  if (
    (opts.ageRange === "0-1" || opts.ageRange === "6m" || haystack.includes("תינוק")) &&
    (haystack.includes("מחית") || haystack.includes("פירה"))
  ) {
    return "purees";
  }

  // Run keyword rules in order.
  for (const rule of RULES) {
    if (ruleMatches(rule, haystack)) return rule.pool;
  }

  // Category-based fallback for unmatched titles.
  if (opts.categorySlugs.includes("baking")) return "defaultSweet";
  if (opts.categorySlugs.includes("by-diet")) return "defaultVegetable";
  if (opts.categorySlugs.includes("for-kids")) return "toddlerFingerFood";

  // Diet hints.
  if (opts.dietTags.some((t) => t.includes("טבעוני") || t.includes("צמחוני"))) {
    return "defaultVegetable";
  }

  // Final default — savory.
  return "defaultSavory";
}

// ----------------------------------------------------------------------------
// VERIFY POOLS — drop dead photo IDs before assignment.
// ----------------------------------------------------------------------------

async function verifyPhotoId(id: string): Promise<boolean> {
  const url = buildUnsplashUrl(id);
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function verifyPools(): Promise<Record<string, string[]>> {
  const verified: Record<string, string[]> = {};
  for (const [pool, ids] of Object.entries(POOLS)) {
    const checks = await Promise.all(
      ids.map(async (id) => ({ id, ok: await verifyPhotoId(id) }))
    );
    const good = checks.filter((c) => c.ok).map((c) => c.id);
    const bad = checks.filter((c) => !c.ok).map((c) => c.id);
    if (bad.length > 0) {
      console.log(`  pool ${pool}: dropped ${bad.length} bad IDs (${bad.join(", ")})`);
    }
    verified[pool] = good;
  }
  return verified;
}

// ----------------------------------------------------------------------------
// MAIN
// ----------------------------------------------------------------------------

async function main() {
  console.log("Verifying photo pools against Unsplash...");
  const verified = await verifyPools();

  // Backstop: ensure no pool is empty. Use defaultSavory as a borrowed fallback.
  const safetyNet = verified.defaultSavory.length > 0
    ? verified.defaultSavory
    : ["1565299624946-b28f40a0ae38"];
  for (const k of Object.keys(verified)) {
    if (verified[k].length === 0) {
      console.warn(`  WARN: pool ${k} is empty after verification, falling back to defaultSavory`);
      verified[k] = safetyNet;
    }
  }

  console.log("Pool sizes after verification:");
  for (const [k, v] of Object.entries(verified)) {
    console.log(`  ${k}: ${v.length}`);
  }

  const recipes = await db.recipe.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      ageRange: true,
      dietTags: true,
      categories: {
        select: { category: { select: { slug: true, parent: { select: { slug: true } } } } },
      },
    },
  });

  console.log(`\nProcessing ${recipes.length} published recipes...`);

  const distribution: Record<string, number> = {};
  let updated = 0;

  for (const r of recipes) {
    const slugs: string[] = [];
    for (const c of r.categories) {
      slugs.push(c.category.slug);
      if (c.category.parent) slugs.push(c.category.parent.slug);
    }
    const poolKey = detectPool({
      title: r.title,
      subtitle: r.subtitle,
      categorySlugs: slugs,
      ageRange: r.ageRange,
      dietTags: r.dietTags,
    });
    distribution[poolKey] = (distribution[poolKey] ?? 0) + 1;

    const newImage = pickFromPool(r.slug, verified[poolKey]);
    await db.recipe.update({
      where: { id: r.id },
      data: { heroImage: newImage },
    });
    updated++;
    if (updated % 100 === 0) {
      console.log(`  ${updated}/${recipes.length}`);
    }
  }

  console.log(`\nDone. Updated ${updated} recipes.`);
  console.log("\nDistribution by dish-type pool:");
  const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  for (const [pool, count] of sorted) {
    console.log(`  ${pool.padEnd(22)} ${count}`);
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

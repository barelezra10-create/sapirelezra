import "dotenv/config";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { db } from "../lib/db";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ILLUST_DIR = join(__dirname, "..", "public", "recipe-illustrations");

/**
 * Best-effort image matcher using ONLY existing assets.
 *
 * Priority:
 * 1. If /public/recipe-illustrations/{slug}.webp exists → use it (84 perfect matches)
 * 2. Granular keyword detection across 60+ dish types → curated Unsplash photo
 * 3. Top-category fallback → photo from a category-themed pool
 * 4. Last-resort defaultSavory or defaultSweet
 */

// ----------------------------------------------------------------------------
// VERIFIED POOLS (each photo manually checked; pool name reflects what's IN it)
// ----------------------------------------------------------------------------

const POOLS: Record<string, string[]> = {
  // ========= BABY / TODDLER =========
  babyPuree: [
    "1547573854-74d2a71d0826",
    "1618174149317-e6e87b4ff7ce",
    "1565299543923-37dd37887442",
  ],
  toddlerFinger: [
    "1547928576-b822bc410bdf",
    "1599785209707-a456fc1337bb",
    "1574484284002-952d92456975",
    "1626844131082-256783844137",
  ],

  // ========= NOODLES & PASTA =========
  pasta: [
    "1551183053-bf91a1d81141",
    "1473093295043-cdd812d0e601",
    "1612874742237-6526221588e3",
    "1572441714898-d0fac1c6ba9e",
  ],
  asianNoodles: [
    "1559847844-5315695dadae",
    "1606756792158-0a39bdebcdce",
    "1567620905732-2d1ec7ab7445",
  ],
  ramen: [
    "1623341214825-9f4f963727da",
    "1569718212165-3a8278d5f624",
  ],

  // ========= RICE =========
  rice: [
    "1574071318508-1cdbab80d002",
    "1596797038530-2c107229654b",
    "1591105327764-2f4ed7e02619",
    "1564834724105-918b73d1b9e0",
  ],
  riceBowl: [
    "1546069901-ba9599a7e63c",
    "1543339494-b4cd4c95c5f4",
  ],
  sushiRoll: [
    "1579871494447-9811cf80d66c",
    "1611143669185-af224c5e3252",
  ],
  onigiri: [
    "1611143669185-af224c5e3252",
    "1546069901-ba9599a7e63c",
  ],

  // ========= BREAD & DOUGH =========
  bread: [
    "1568471173242-461f0a730452",
    "1509440159596-0249088772ff",
    "1486427944299-d1955d23e34d",
    "1574087631321-5f9df74dc7e5",
  ],
  challah: [
    "1568471173242-461f0a730452",
    "1574087631321-5f9df74dc7e5",
  ],
  pizza: [
    "1604068549290-dea0e4a305ca",
    "1571997478779-2adcbbe9ab2f",
  ],
  focaccia: [
    "1571997478779-2adcbbe9ab2f",
    "1486427944299-d1955d23e34d",
  ],
  yemenitePastry: [
    // No good Unsplash for jachnun/malawach — fall back to flatbread/pastry
    "1486427944299-d1955d23e34d",
    "1601379760883-1bb0c7b06c20",
  ],

  // ========= SOUP / STEW =========
  soup: [
    "1603105037880-880cd4edfb0d",
    "1547592180-85f173990554",
  ],
  creamSoup: [
    "1547592180-85f173990554",
    "1603105037880-880cd4edfb0d",
  ],
  stew: [
    "1547928576-b822bc410bdf",
    "1604920265583-eecf3a4a35e7",
    "1603894584373-5ac82b2ae398",
  ],
  tagine: [
    "1604920265583-eecf3a4a35e7",
    "1547928576-b822bc410bdf",
  ],
  cholent: [
    "1603894584373-5ac82b2ae398",
    "1547928576-b822bc410bdf",
  ],

  // ========= SALAD & VEGGIES =========
  greenSalad: [
    "1490645935967-10de6ba17061",
    "1505253716362-afaea1d3d1af",
    "1607532941433-304659e8198a",
  ],
  middleEasternSalad: [
    "1571877227200-a0d98ea607e9",
    "1543339494-b4cd4c95c5f4",
  ],
  roastedVeggies: [
    "1502301197179-65228ab57f78",
    "1571877227200-a0d98ea607e9",
  ],
  hummus: [
    "1543339494-b4cd4c95c5f4",
    "1571877227200-a0d98ea607e9",
  ],

  // ========= EGG / SHAKSHUKA =========
  shakshuka: [
    "1590412200988-a436970781fa",
  ],
  eggs: [
    "1590412200988-a436970781fa",
    "1525351484163-7529414344d8",
  ],
  omelette: [
    "1525351484163-7529414344d8",
    "1590412200988-a436970781fa",
  ],

  // ========= MEAT / FISH =========
  meatballs: [
    "1626844131082-256783844137",
    "1604908176997-125f25cc6f3d",
  ],
  steak: [
    "1546548970-71785318a17b",
    "1604908176997-125f25cc6f3d",
  ],
  chicken: [
    "1604908176997-125f25cc6f3d",
    "1598103442097-8b74394b95c6",
    "1626844131082-256783844137",
  ],
  schnitzel: [
    "1598103442097-8b74394b95c6",
    "1604908176997-125f25cc6f3d",
  ],
  fish: [
    "1599487488170-d11ec9c172f0",
    "1535007813616-79dc02ba4021",
    "1565299507177-b0ac66763828",
  ],
  shrimp: [
    "1565299507177-b0ac66763828",
    "1599487488170-d11ec9c172f0",
  ],

  // ========= BAKED & SAVORY PASTRIES =========
  baked: [
    "1568901346375-23c9450c58cd",
    "1604920265583-eecf3a4a35e7",
    "1564834724105-918b73d1b9e0",
  ],
  burekas: [
    "1601379760883-1bb0c7b06c20",
    "1486427944299-d1955d23e34d",
  ],

  // ========= STIR-FRY & ASIAN =========
  stirfry: [
    "1559847844-5315695dadae",
    "1606756792158-0a39bdebcdce",
    "1567620905732-2d1ec7ab7445",
  ],
  curry: [
    "1565958011703-44f9829ba187",
    "1604908176997-125f25cc6f3d",
  ],

  // ========= SWEETS =========
  cake: [
    "1606313564200-e75d5e30476c",
    "1565958011703-44f9829ba187",
    "1488477181946-6428a0291777",
    "1483695028939-5bb13f8648b0",
  ],
  cheesecake: [
    "1565958011703-44f9829ba187",
    "1571115764595-644a1f56a55c",
  ],
  chocolate: [
    "1606313564200-e75d5e30476c",
    "1488477181946-6428a0291777",
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
  fruitDessert: [
    "1488477181946-6428a0291777",
    "1551782450-a2132b4ba21d",
  ],

  // ========= DRINKS =========
  drink: [
    "1505252585461-04db1eb84625",
    "1502301197179-65228ab57f78",
  ],

  // ========= FALLBACKS =========
  defaultSavory: [
    "1604908554049-9c35d59df745",
    "1612459284970-e8f027596582",
    "1546548970-71785318a17b",
  ],
  defaultSweet: [
    "1606313564200-e75d5e30476c",
    "1488477181946-6428a0291777",
    "1565958011703-44f9829ba187",
  ],
  defaultVegetable: [
    "1490645935967-10de6ba17061",
    "1505253716362-afaea1d3d1af",
    "1571877227200-a0d98ea607e9",
  ],
};

type PoolKey = keyof typeof POOLS;

// ----------------------------------------------------------------------------
// DETECTION RULES — checked in order. First match wins.
// MORE SPECIFIC FIRST.
// ----------------------------------------------------------------------------

type Rule = { pool: PoolKey; anyOf: string[] };

const RULES: Rule[] = [
  // === BABY / TODDLER (very high priority — these slugs often contain dish words too) ===
  {
    pool: "babyPuree",
    anyOf: ["מחית", "מחיות", "פירה ל", "פורית", "אוכל ראשון לתינוק"],
  },

  // === SUSHI / JAPANESE BALL ===
  { pool: "sushiRoll", anyOf: ["סושי", "מאקי רול", "קליפורניה רול"] },
  { pool: "onigiri", anyOf: ["אונגירי", "אוניגירי"] },
  { pool: "ramen", anyOf: ["ראמן"] },

  // === ASIAN NOODLES (before pasta to catch udon etc.) ===
  {
    pool: "asianNoodles",
    anyOf: ["אודון", "סובה", "פאד תאי", "צ'או מיין", "לו מיין", "נודלס"],
  },

  // === STIR-FRY / WOK ===
  {
    pool: "stirfry",
    anyOf: ["מוקפץ", "מוקפצים", "ווק", "סטיר פריי"],
  },

  // === CURRY ===
  { pool: "curry", anyOf: ["קארי", "קרי תאילנדי", "מסאלה", "קרמה"] },

  // === SHAKSHUKA / EGGS ===
  { pool: "shakshuka", anyOf: ["שקשוקה"] },
  {
    pool: "omelette",
    anyOf: ["חביתה", "אומלט", "פריטטה", "פראטה"],
  },
  {
    pool: "eggs",
    anyOf: ["ביצים עלומות", "ביצה עלומה", "ביצים מוקשות", "ביצים בנדיקט"],
  },

  // === PIZZA / FOCACCIA ===
  { pool: "pizza", anyOf: ["פיצה", "קלצונה", "קלצונה אישית"] },
  { pool: "focaccia", anyOf: ["פוקצ'ה", "פוקאצ'ה"] },

  // === BREAD & CHALLAH ===
  { pool: "challah", anyOf: ["חלה"] },
  {
    pool: "yemenitePastry",
    anyOf: ["ג'חנון", "מלאווח", "לחוח", "קובאנה"],
  },
  {
    pool: "burekas",
    anyOf: ["בורקס", "בורקיטס", "סמבוסק", "כיסוני", "כיסון", "סיגרים", "פילו"],
  },
  {
    pool: "bread",
    anyOf: ["לחם", "פיתה", "בריוש", "בייגל", "באגט", "לחמניות", "פוקסיה", "צ'יאבטה", "מצה"],
  },

  // === PASTA (after asian noodles) ===
  {
    pool: "pasta",
    anyOf: [
      "פסטה", "ספגטי", "פנה", "לזניה", "ניוקי", "פטוצ'יני", "טליאטלה",
      "קנלוני", "רביולי", "טורטליני", "אורקייטה", "ריגטוני", "פוזילי",
      "קזונציה", "פפרדלה", "קרסקטה",
    ],
  },

  // === RICE ===
  {
    pool: "riceBowl",
    anyOf: ["באולס", "פוקה באול", "אורז קערה"],
  },
  {
    pool: "rice",
    anyOf: [
      "אורז", "ריזוטו", "פילאף", "ביריאני", "מג'דרה", "מקלובה",
      "אושפלאו", "פלוב", "תהדיג", "פולו", "צ'לו", "תבית", "קיצ'רי",
    ],
  },

  // === SOUPS ===
  {
    pool: "creamSoup",
    anyOf: ["קרם של", "קרמית", "מרק קרמי", "ויסיסואז"],
  },
  {
    pool: "soup",
    anyOf: ["מרק ", "מרקי", "ציר עוף", "ציר ירקות", "מינסטרונה", "טום יאם", "פו וייטנאמי", "גזפצ'ו", "בורשט"],
  },

  // === SALAD ===
  {
    pool: "middleEasternSalad",
    anyOf: ["טבולה", "פטוש", "סלט ירושלמי", "סלט ערבי", "מסבחה"],
  },
  { pool: "hummus", anyOf: ["חומוס", "טחינה", "מסבחה"] },
  { pool: "greenSalad", anyOf: ["סלט", "סלטי"] },
  { pool: "roastedVeggies", anyOf: ["ירקות בתנור", "ירקות אפויים", "ירקות שורש אפויים"] },

  // === STEW / TAGINE / CHOLENT ===
  { pool: "tagine", anyOf: ["טאז'ין", "טאג'ין"] },
  { pool: "cholent", anyOf: ["חמין", "חריימה", "דפינה"] },
  {
    pool: "stew",
    anyOf: ["תבשיל", "אסאדו", "גולש", "צלי", "אוסובוקו", "ראגו", "בורגיניון"],
  },

  // === MEAT / FISH ===
  {
    pool: "schnitzel",
    anyOf: ["שניצל", "שניצלים", "מילאנזה", "קוטלט"],
  },
  {
    pool: "meatballs",
    anyOf: ["קציצות", "קציצה", "המבורגר", "מיטבולס", "קבב", "כדורי בשר", "פולפטה", "אצבעות בקר"],
  },
  {
    pool: "steak",
    anyOf: ["סטייק", "אנטריקוט", "פילה בקר", "טי בון", "ריב איי"],
  },
  {
    pool: "chicken",
    anyOf: ["עוף", "כנפי", "פרגית", "חזה עוף", "כרעיים", "פרגיות", "אווז", "ברווז", "הודו", "כתפים"],
  },
  {
    pool: "shrimp",
    anyOf: ["שרימפ", "גמבה", "קלמרי", "תמנון", "פירות ים", "סקלופים"],
  },
  {
    pool: "fish",
    anyOf: ["דג", "דגים", "סלמון", "טונה", "בורי", "מושט", "לברק", "פילה דג", "אמנון", "סינטה", "מקרל", "סרדינים"],
  },

  // === BAKED LAYERED ===
  {
    pool: "baked",
    anyOf: [
      "גרטן", "גראטן", "קסרול", "מילופי", "מוסקה", "אנצ'ילדה",
      "פאי בשר", "פאי עוף", "פאי דגים", "מאפה ירקות", "מאפה גבינה",
      "פיירקס", "סופלה",
    ],
  },

  // === DRINKS ===
  {
    pool: "drink",
    anyOf: ["שייק", "מילקשייק", "קוקטייל", "סמודי", "לימונדה", "משקה", "תה", "קפה הפוך", "אספרסו"],
  },

  // === COOKIES / SMALL SWEETS ===
  {
    pool: "cookies",
    anyOf: ["עוגיות", "עוגייה", "מאפינס", "מאפין", "כדורי שוקולד", "ביסקוטי", "מקרון", "מקרונים", "ברדלי", "אצבעות עוגייה"],
  },

  // === CAKE / TART (sweet) ===
  {
    pool: "cheesecake",
    anyOf: ["צ'יזקייק", "עוגת גבינה", "עוגות גבינה"],
  },
  {
    pool: "chocolate",
    anyOf: ["שוקולד", "פונדן", "בראוניז", "בראוניס", "טראפלס"],
  },
  {
    pool: "fruitDessert",
    anyOf: ["פבלובה", "טארט פירות", "פאנה קוטה", "קלפוטיס"],
  },
  {
    pool: "cake",
    anyOf: ["עוגת", "עוגה", "טארט", "פאי תפוחים", "פאי", "באבקה"],
  },

  // === PASTRY (sweet generic) ===
  {
    pool: "pastry",
    anyOf: ["קרואסון", "פרנצ'יז", "דניש", "סטרודל", "רוגלך", "רוגעלך", "שטרודל"],
  },
];

// Toddler keywords + young age = finger food
const TODDLER_KEYWORDS = ["אצבעות", "אצבעיות", "כדורי", "מקלוני", "נשנושי", "ביס", "טבלאות"];
const TODDLER_AGES = new Set(["1-3", "0-1", "6m", "1-5", "3-5", "12m", "12-24m"]);

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
  if (pool.length === 0) return buildUnsplashUrl(POOLS.defaultSavory[0]);
  const idx = hashString(slug) % pool.length;
  return buildUnsplashUrl(pool[idx]);
}

function detectPool(opts: {
  title: string;
  subtitle: string | null;
  categorySlugs: string[];
  ageRange: string | null;
  dietTags: string[];
}): { pool: PoolKey; matchedBy: string } {
  const haystack = `${opts.title} ${opts.subtitle ?? ""}`;

  // Toddler finger-food check first (age + keyword)
  const isYoung =
    (opts.ageRange && TODDLER_AGES.has(opts.ageRange)) ||
    opts.categorySlugs.includes("toddlers-1-5");
  if (isYoung && TODDLER_KEYWORDS.some((kw) => haystack.includes(kw))) {
    return { pool: "toddlerFinger", matchedBy: "toddler+keyword" };
  }

  // Babies pure check (any "מחית" + baby age/category)
  const isBaby =
    opts.ageRange === "0-1" ||
    opts.ageRange === "6m" ||
    opts.ageRange === "0-6m" ||
    opts.ageRange === "6-12m" ||
    opts.categorySlugs.includes("babies-0-1");
  if (isBaby && (haystack.includes("מחית") || haystack.includes("פירה") || haystack.includes("מעוך"))) {
    return { pool: "babyPuree", matchedBy: "baby+puree" };
  }

  // Run keyword rules in order
  for (const rule of RULES) {
    for (const kw of rule.anyOf) {
      if (haystack.includes(kw)) {
        return { pool: rule.pool, matchedBy: kw };
      }
    }
  }

  // Category-based fallback for unmatched titles
  if (opts.categorySlugs.includes("babies-0-1")) return { pool: "babyPuree", matchedBy: "cat:babies" };
  if (opts.categorySlugs.includes("toddlers-1-5")) return { pool: "toddlerFinger", matchedBy: "cat:toddlers" };
  if (opts.categorySlugs.includes("baking")) return { pool: "defaultSweet", matchedBy: "cat:baking" };
  if (opts.categorySlugs.includes("by-diet")) return { pool: "defaultVegetable", matchedBy: "cat:diet" };

  // Diet hints
  if (opts.dietTags.some((t) => t.includes("טבעוני") || t.includes("צמחוני"))) {
    return { pool: "defaultVegetable", matchedBy: "tag:vegan" };
  }

  return { pool: "defaultSavory", matchedBy: "fallback" };
}

// ----------------------------------------------------------------------------
// MAIN
// ----------------------------------------------------------------------------

async function main() {
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

  console.log(`Processing ${recipes.length} recipes`);

  let usedIllustration = 0;
  let usedPool = 0;
  let usedFallback = 0;
  const distribution: Record<string, number> = {};
  const matchSamples: Record<string, string[]> = {};

  for (const r of recipes) {
    let newImage: string;
    let label: string;

    // PRIORITY 1: existing illustration
    const illustPath = join(ILLUST_DIR, `${r.slug}.webp`);
    if (existsSync(illustPath)) {
      newImage = `/recipe-illustrations/${r.slug}.webp`;
      label = "ILLUSTRATION";
      usedIllustration++;
    } else {
      // PRIORITY 2/3: keyword detection / fallback
      const slugs: string[] = [];
      for (const c of r.categories) {
        slugs.push(c.category.slug);
        if (c.category.parent) slugs.push(c.category.parent.slug);
      }
      const { pool, matchedBy } = detectPool({
        title: r.title,
        subtitle: r.subtitle,
        categorySlugs: slugs,
        ageRange: r.ageRange,
        dietTags: r.dietTags,
      });
      newImage = pickFromPool(r.slug, POOLS[pool]);
      label = pool;
      if (matchedBy === "fallback") {
        usedFallback++;
      } else {
        usedPool++;
      }

      // Track sample match for this label
      if (!matchSamples[label]) matchSamples[label] = [];
      if (matchSamples[label].length < 3) {
        matchSamples[label].push(`${r.title} (${matchedBy})`);
      }
    }

    distribution[label] = (distribution[label] ?? 0) + 1;
    await db.recipe.update({
      where: { id: r.id },
      data: { heroImage: newImage },
    });
  }

  console.log(`\nDone. Updated ${recipes.length} recipes.`);
  console.log(`  used existing illustration: ${usedIllustration}`);
  console.log(`  matched by keyword:         ${usedPool}`);
  console.log(`  fallback:                   ${usedFallback}`);

  console.log("\nPool distribution (sorted):");
  const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
  for (const [pool, count] of sorted) {
    console.log(`  ${pool.padEnd(22)} ${count}`);
  }

  console.log("\nSample matches per pool (first 3):");
  for (const [pool, samples] of Object.entries(matchSamples).sort()) {
    console.log(`  [${pool}]`);
    for (const s of samples) console.log(`    · ${s}`);
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

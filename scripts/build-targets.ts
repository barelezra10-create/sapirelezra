import "dotenv/config";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type Target = {
  title: string;
  categorySlugs: string[];
  tagHints: string[];
  ageRange?: string;
};

type TargetSpec = {
  categorySlugs: string[];
  count: number;
  brief: string;
};

const TARGETS: TargetSpec[] = [
  { categorySlugs: ["for-kids", "babies-0-1"],            count: 80,  brief: "אוכל לתינוקות בגילאי 0-12 חודש: פירה, מחית, אצבעות-אוכל ראשונות" },
  { categorySlugs: ["for-kids", "toddlers-1-5"],          count: 120, brief: "אוכל לפעוטות וילדי גן: ידידותי לטעם, מרקם רך-בינוני" },
  { categorySlugs: ["baking", "breads"],                  count: 40,  brief: "לחמים מסוגים שונים, כולל פוקצ'ה, חלות, פיתות, באגטים" },
  { categorySlugs: ["baking", "cakes"],                   count: 50,  brief: "עוגות לכל אירוע: שמרים, ספוג, גבינה, שוקולד, פירות" },
  { categorySlugs: ["baking", "pastries"],                count: 40,  brief: "מאפים מתוקים ומלוחים: בורקסים, רוגלך, קרואסונים" },
  { categorySlugs: ["baking", "yeast-doughs"],            count: 30,  brief: "בצקי שמרים: חלה, פוקצ'ה, פיצה ביתית, לחמניות" },
  { categorySlugs: ["grandma-cuisines", "moroccan"],      count: 50,  brief: "מטבח מרוקאי קלאסי: טאג'ין, מסבחה, חריימה, קוסקוס, מופלטה" },
  { categorySlugs: ["grandma-cuisines", "tripolitan"],    count: 40,  brief: "מטבח טריפוליטאי: חריימה, מפרום, בזין, חמין לוב" },
  { categorySlugs: ["grandma-cuisines", "iraqi"],         count: 40,  brief: "מטבח עיראקי: קובה, אמבא, סמבוסק, תבית, קיצ'רי" },
  { categorySlugs: ["grandma-cuisines", "persian"],       count: 30,  brief: "מטבח פרסי: פולו, חורש, גונדי, גז, חלאט" },
  { categorySlugs: ["grandma-cuisines", "yemenite"],      count: 30,  brief: "מטבח תימני: מרק, ג'חנון, מלאווח, סחוג, חילבה" },
  { categorySlugs: ["grandma-cuisines", "bukharan"],      count: 20,  brief: "מטבח בוכרי: פלוב, מנטי, ססגנדך, חלוואים" },
  { categorySlugs: ["world-cuisines", "french"],          count: 60,  brief: "מטבח צרפתי קלאסי וביסטרו: סופלה, גרטן, קוק או ון, רטטוי, קישים, מקרונים" },
  { categorySlugs: ["world-cuisines", "japanese"],        count: 50,  brief: "מטבח יפני: סושי, רמן, טמפורה, אונגירי, אודון, מיסו, אגדאשי" },
  { categorySlugs: ["world-cuisines", "italian"],         count: 60,  brief: "מטבח איטלקי: פסטות, ריזוטו, פיצה, אנטיפסטי, טירמיסו" },
  { categorySlugs: ["world-cuisines", "thai"],            count: 30,  brief: "מטבח תאילנדי: קארי, פאד תאי, סלט נודלס, טום יאם" },
  { categorySlugs: ["israeli-everyday", "friday-dinner"], count: 40,  brief: "ארוחת שישי ישראלית: חמין, צ'יפס תוצרת בית, סלטים, עוף בתנור" },
  { categorySlugs: ["israeli-everyday", "holiday"],       count: 40,  brief: "מתכוני חג ישראלי: ראש השנה, פסח, חנוכה, סוכות, שבועות" },
  { categorySlugs: ["israeli-everyday", "ten-minute"],    count: 40,  brief: "ארוחות מהירות: שקשוקה, פסטה, חביתות, סלטים מורכבים" },
  { categorySlugs: ["israeli-everyday", "meal-prep"],     count: 30,  brief: "הכנה מראש לשבוע: סלטי קטניות, גרעינים, ירקות אפויים, דייסות" },
  { categorySlugs: ["by-diet", "vegan"],                  count: 30,  brief: "מתכונים טבעוניים מלאים, מעבר לסלטים: צ'ילי, קציצות, גבינות אגוזים" },
  { categorySlugs: ["by-diet", "gluten-free"],            count: 25,  brief: "ללא גלוטן: לחמים מקמחים חלופיים, פסטות, אפיות" },
  { categorySlugs: ["by-diet", "paleo"],                  count: 25,  brief: "פליאו: בשר, ירקות, אגוזים, ללא דגנים וקטניות" },
  { categorySlugs: ["by-diet", "keto"],                   count: 20,  brief: "קטו: שומני, חלבוני, פחמימה נמוכה" },
];

const SYSTEM = `את עוזרת לעורך תוכן להציע כותרות מתכון ייחודיות בעברית. הכותרות צריכות להיות מגוונות, ספציפיות, ולא חוזרות על עצמן. הימנעי מנוסחים גנריים. כל כותרת צריכה להיות מתכון מובהק שמישהו יכול לבשל. שלבי קלאסיקות, פירושים מודרניים, וריאציות, גרסאות עם טוויסט, וגרסאות בריאות יותר. הימנעי משימוש במקפים ארוכים (—).`;

function extractJsonArray(text: string): string {
  // Strip markdown fences
  let cleaned = text.replace(/```json\n?|```/g, "").trim();
  // Find first '[' and last ']' — defensive in case of leading prose
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return cleaned;
}

const REQUEST_TIMEOUT_MS = 90_000;
const BATCH_SIZE = 30;

async function generateTitlesBatch(
  ai: GoogleGenAI,
  brief: string,
  count: number,
  categorySlugs: string[],
  batchIndex: number,
): Promise<Target[]> {
  const isKidsCategory = categorySlugs.includes("for-kids");
  const ageGuidance = isKidsCategory
    ? `כל כותרת צריכה לכלול ageRange: "0-6m" או "6-12m" עבור תינוקות, "1-3y" או "3-5y" עבור פעוטות.`
    : "";

  const userPrompt = `${brief}

זאת קבוצה ${batchIndex + 1}. תני לי ${count} כותרות מתכון בעברית, חדשות וייחודיות, שלא שמעת קודם. שלבי קלאסיקות, וריאציות מודרניות, וטוויסטים יצירתיים. ${ageGuidance}

tagHints הם 2-5 תגיות עברית רלוונטיות לזיהוי המתכון (למשל: "טבעוני", "מהיר", "ללא גלוטן", "ארוחת ערב", "חגיגי").

פלט JSON: array של אובייקטים בפורמט: { "title": string, "tagHints": string[]${isKidsCategory ? ', "ageRange": string' : ""} }`;

  const requestPromise = ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: SYSTEM,
      responseMimeType: "application/json",
      temperature: 0.95,
    },
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`request timeout after ${REQUEST_TIMEOUT_MS}ms`)), REQUEST_TIMEOUT_MS)
  );

  const response = await Promise.race([requestPromise, timeoutPromise]);
  const text = (response as any).text ?? "";
  const cleaned = extractJsonArray(text);

  let arr: Array<{ title: string; tagHints?: string[]; ageRange?: string }>;
  try {
    arr = JSON.parse(cleaned);
  } catch (err) {
    console.error(`  JSON parse error. Raw (first 300 chars): ${text.slice(0, 300)}`);
    throw err;
  }

  if (!Array.isArray(arr)) {
    throw new Error("Response was not an array");
  }

  return arr
    .filter((item) => item && typeof item.title === "string" && item.title.trim().length > 0)
    .map((item) => ({
      title: item.title.trim(),
      categorySlugs: [...categorySlugs],
      tagHints: Array.isArray(item.tagHints) ? item.tagHints : [],
      ...(item.ageRange ? { ageRange: item.ageRange } : {}),
    }));
}

async function generateTitles(
  ai: GoogleGenAI,
  brief: string,
  count: number,
  categorySlugs: string[],
): Promise<Target[]> {
  const batches = Math.ceil(count / BATCH_SIZE);
  const all: Target[] = [];
  for (let i = 0; i < batches; i++) {
    const batchCount = Math.min(BATCH_SIZE, count - i * BATCH_SIZE);
    const titles = await generateTitlesBatch(ai, brief, batchCount, categorySlugs, i);
    all.push(...titles);
  }
  return all;
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not set");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const all: Target[] = [];
  const seen = new Set<string>();

  const outPath = join(__dirname, "recipe-targets.json");

  function flush() {
    writeFileSync(outPath, JSON.stringify({ count: all.length, targets: all }, null, 2), "utf-8");
  }

  for (const t of TARGETS) {
    const label = t.categorySlugs.join("/");
    console.log(`Generating ${t.count} titles for ${label}...`);
    let attempt = 0;
    while (attempt < 3) {
      try {
        const titles = await generateTitles(ai, t.brief, t.count, t.categorySlugs);
        let added = 0;
        for (const tt of titles) {
          const key = tt.title.trim();
          if (seen.has(key)) continue;
          seen.add(key);
          all.push(tt);
          added++;
        }
        console.log(`  Added ${added} unique titles (returned ${titles.length}; total: ${all.length})`);
        flush(); // checkpoint after each successful category
        break;
      } catch (err: unknown) {
        attempt++;
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  Error for ${label} (attempt ${attempt}/3): ${msg}`);
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    }
  }

  flush();
  console.log(`\nTotal targets: ${all.length}`);
  console.log(`Wrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

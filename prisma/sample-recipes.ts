import { db } from "../lib/db";

type Sample = {
  slug: string;
  title: string;
  subtitle: string;
  heroImage: string;
  sapirIntro: string;
  prepTimeMin: number;
  cookTimeMin: number;
  totalTimeMin: number;
  servings: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  ingredients: { groupName?: string; items: { name: string; quantity?: string; unit?: string }[] }[];
  steps: { order: number; text: string }[];
  sapirTips: string[];
  kosher: "DAIRY" | "MEAT" | "PAREVE" | "NOT_KOSHER";
  dietTags: string[];
  ageRange?: string;
  seoTitle: string;
  seoDescription: string;
  categorySlugs: string[];
};

const SAMPLES: Sample[] = [
  {
    slug: "shakshuka-shel-yom-shishi",
    title: "שקשוקה של ימי שישי",
    subtitle: "המתכון שלקחתי מהדודה שלי ושיניתי טיפה",
    heroImage: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1600&q=80",
    sapirIntro: "השקשוקה הזו ליוותה אותי מילדות. הסוד הוא להמתין שהבצל יזהיב באמת, ולא למהר עם העגבניות. תני לטעמים זמן.",
    prepTimeMin: 10,
    cookTimeMin: 25,
    totalTimeMin: 35,
    servings: 4,
    difficulty: "EASY",
    ingredients: [
      {
        items: [
          { name: "בצל גדול קצוץ", quantity: "1" },
          { name: "פלפל אדום", quantity: "1" },
          { name: "שיני שום קצוצות", quantity: "4" },
          { name: "פפריקה מתוקה", quantity: "1", unit: "כפית" },
          { name: "כמון", quantity: "1", unit: "כפית" },
          { name: "עגבניות מרוסקות", quantity: "1", unit: "פחית גדולה" },
          { name: "ביצים", quantity: "6" },
          { name: "פטרוזיליה", quantity: "חופן" },
          { name: "מלח ופלפל", quantity: "לפי הטעם" },
        ],
      },
    ],
    steps: [
      { order: 1, text: "במחבת רחבה, חממי שמן זית עם הבצל. תני לו להזהיב בנחת, 8-10 דקות." },
      { order: 2, text: "הוסיפי את הפלפל, השום והתבלינים. ערבבי ובשלי 3 דקות נוספות." },
      { order: 3, text: "שפכי את העגבניות, תבלי במלח ובפלפל. תני לרוטב להתעבות 12-15 דקות עד שהוא הופך עמוק וכבד." },
      { order: 4, text: "צרי גומות ברוטב, שברי לתוכן את הביצים. כסי במכסה ובשלי 5-7 דקות עד שהחלבון מתמצק והחלמון עוד נוזל." },
      { order: 5, text: "פזרי פטרוזיליה ועוד פלפל שחור גרוס. הגישי ישר מהמחבת עם לחם טוב." },
    ],
    sapirTips: [
      "אל תפחדי מאש גבוהה בהתחלה לבצל - זה מה שנותן את הקרמליזציה.",
      "אם את אוהבת חריף, חצי פלפל חריף קצוץ עם הבצל יעשה פלא.",
    ],
    kosher: "PAREVE",
    dietTags: ["טבעוני אופציונלי", "ללא גלוטן"],
    seoTitle: "שקשוקה של ימי שישי | ספיר אלעזרא",
    seoDescription: "מתכון השקשוקה האולטימטיבי לארוחת בוקר משפחתית. רוטב עגבניות עשיר, ביצים רכות, וטיפים מקצועיים מהמטבח של ספיר.",
    categorySlugs: ["israeli-everyday", "ten-minute"],
  },
  {
    slug: "halla-klua-im-shumshum",
    title: "חלה קלוית עם שומשום",
    subtitle: "בצק שמרים שמרגיש כמו חיבוק",
    heroImage: "https://images.unsplash.com/photo-1568471173242-461f0a730452?auto=format&fit=crop&w=1600&q=80",
    sapirIntro: "סבתא רבקה לימדה אותי שחלה טובה מתחילה בסבלנות עם הבצק. אל תמהרי. תני לו לתפוח פעמיים, וחלוקיו יהיו חלקים כמו משי.",
    prepTimeMin: 30,
    cookTimeMin: 30,
    totalTimeMin: 180,
    servings: 8,
    difficulty: "MEDIUM",
    ingredients: [
      {
        groupName: "לבצק",
        items: [
          { name: "קמח לבן", quantity: "1", unit: "ק״ג" },
          { name: "מים פושרים", quantity: "350", unit: "מ״ל" },
          { name: "סוכר", quantity: "100", unit: "גרם" },
          { name: "שמרים יבשים", quantity: "20", unit: "גרם" },
          { name: "מלח", quantity: "1", unit: "כף" },
          { name: "ביצים", quantity: "2" },
          { name: "שמן", quantity: "100", unit: "מ״ל" },
        ],
      },
      {
        groupName: "לציפוי",
        items: [
          { name: "ביצה טרופה", quantity: "1" },
          { name: "שומשום שחור ולבן", quantity: "לפיזור" },
        ],
      },
    ],
    steps: [
      { order: 1, text: "במיקסר, ערבבי את כל מרכיבי הבצק (חוץ מהמלח). לשי 5 דקות במהירות בינונית." },
      { order: 2, text: "הוסיפי את המלח ולשי עוד 10 דקות עד שהבצק חלק ואלסטי." },
      { order: 3, text: "כסי במגבת והשאירי לתפיחה במקום חמים שעה וחצי, עד שהבצק מכפיל את נפחו." },
      { order: 4, text: "חלקי לשני חלקים, כל חלק לשלוש פתילות. קלעי חלות מהודקות." },
      { order: 5, text: "תני להן לתפוח עוד 40 דקות על תבנית עם נייר אפייה." },
      { order: 6, text: "מרחי בביצה הטרופה, פזרי שומשום בנדיבות." },
      { order: 7, text: "אפי בתנור שחומם ל-180 מעלות 25-30 דקות עד הזהבה. אל תפתחי את התנור באמצע." },
    ],
    sapirTips: [
      "חוסר סבלנות בקליעה זה הסוד של חלה ש'מתפרקת'. הדקי כל פתילה לפני שאת מתחילה לקלוע.",
      "אם הבצק תופח לאט, הוסיפי כפית סוכר נוספת למים עם השמרים.",
      "החלות הכי טעימות ביום שני - תהפכי אותן לפרנץ' טוסט.",
    ],
    kosher: "PAREVE",
    dietTags: [],
    seoTitle: "חלה ביתית קלוית עם שומשום | ספיר אלעזרא",
    seoDescription: "מתכון חלה לארוחת שישי, בצק שמרים רך ואוורירי עם ציפוי שומשום שחור ולבן. הוראות צעד-אחר-צעד וטיפים מקצועיים.",
    categorySlugs: ["baking", "yeast-doughs", "israeli-everyday", "friday-dinner"],
  },
  {
    slug: "tagine-katom-shel-savta",
    title: "טאז'ין כתום של סבתא ציפורה",
    subtitle: "כתף כבש בדבש, שזיפים ושקדים",
    heroImage: "https://images.unsplash.com/photo-1547928576-b822bc410bdf?auto=format&fit=crop&w=1600&q=80",
    sapirIntro: "סבתא ציפורה הייתה מבשלת את זה כל ערב חג. הבית היה מתמלא בריח של קינמון וכבש. זה בישול איטי, אבל התוצאה - לא נשכחת.",
    prepTimeMin: 25,
    cookTimeMin: 150,
    totalTimeMin: 175,
    servings: 6,
    difficulty: "MEDIUM",
    ingredients: [
      {
        items: [
          { name: "כתף כבש מנוקה ומחותכת", quantity: "1.5", unit: "ק״ג" },
          { name: "בצל גדול פרוס", quantity: "2" },
          { name: "שזיפים מיובשים", quantity: "200", unit: "גרם" },
          { name: "שקדים מולבנים", quantity: "100", unit: "גרם" },
          { name: "דבש", quantity: "3", unit: "כפות" },
          { name: "קינמון מקלות", quantity: "2" },
          { name: "ג׳ינג׳ר טחון", quantity: "1", unit: "כפית" },
          { name: "כורכום", quantity: "1", unit: "כפית" },
          { name: "פלפל שחור גרוס", quantity: "1", unit: "כפית" },
          { name: "מלח", quantity: "לפי הטעם" },
          { name: "מים", quantity: "500", unit: "מ״ל" },
          { name: "פטרוזיליה וכוסברה קצוצים", quantity: "לקישוט" },
        ],
      },
    ],
    steps: [
      { order: 1, text: "בסיר טאז'ין או סיר כבד, חממי שמן זית. צלי את הכבש בקבוצות עד שמשחים מכל הצדדים." },
      { order: 2, text: "הוציאי את הבשר. הוסיפי את הבצל לסיר ובשלי 10 דקות עד שמתרכך והופך זהוב." },
      { order: 3, text: "החזירי את הבשר לסיר. הוסיפי את התבלינים, מלח ופלפל." },
      { order: 4, text: "שפכי מים, הביאי לרתיחה עדינה. כסי, הנמיכי לאש מינימלית, ובשלי שעה וחצי." },
      { order: 5, text: "הוסיפי את השזיפים, השקדים והדבש. בשלי עוד 30 דקות בלי כיסוי, עד שהרוטב מסמיך והבשר נמס." },
      { order: 6, text: "פזרי פטרוזיליה וכוסברה. הגישי עם קוסקוס או אורז לבן." },
    ],
    sapirTips: [
      "הסוד לטאז'ין מושלם הוא לא לחפף על שלב הצליה. הקרמליזציה של הבשר נותנת את העומק.",
      "אם אין לך מקלות קינמון, חצי כפית טחון תעשה את העבודה. אבל המקלות נותנים ניחוח אחר.",
    ],
    kosher: "MEAT",
    dietTags: [],
    seoTitle: "טאז'ין כבש מרוקאי בדבש ושזיפים | ספיר אלעזרא",
    seoDescription: "מתכון טאז'ין מרוקאי קלאסי עם כתף כבש, שזיפים ושקדים. בישול איטי שמביא את הטעמים של סבתא לשולחן.",
    categorySlugs: ["grandma-cuisines", "moroccan", "israeli-everyday", "holiday"],
  },
  {
    slug: "chocolate-fondant",
    title: "פונדן שוקולד צרפתי",
    subtitle: "המנה שגרמה לי להישאר עוד שנה בפריז",
    heroImage: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1600&q=80",
    sapirIntro: "פונדן הוא לא קסם. זה תזמון. שתים עשרה דקות בדיוק. לא דקה יותר ולא דקה פחות. ואז את שוברת את הקרום ורואה את הלבה הזורמת.",
    prepTimeMin: 15,
    cookTimeMin: 12,
    totalTimeMin: 27,
    servings: 4,
    difficulty: "MEDIUM",
    ingredients: [
      {
        items: [
          { name: "שוקולד מריר 70%", quantity: "200", unit: "גרם" },
          { name: "חמאה", quantity: "150", unit: "גרם" },
          { name: "ביצים", quantity: "3" },
          { name: "חלמונים", quantity: "3" },
          { name: "סוכר", quantity: "100", unit: "גרם" },
          { name: "קמח", quantity: "60", unit: "גרם" },
          { name: "מלח", quantity: "קמצוץ" },
        ],
      },
    ],
    steps: [
      { order: 1, text: "חממי תנור ל-200 מעלות. שמני 4 רמקינים בחמאה ופזרי קקאו." },
      { order: 2, text: "המיסי את השוקולד עם החמאה בבן-מארי. ערבבי עד אחיד." },
      { order: 3, text: "בקערה נפרדת, הקציפי את הביצים, החלמונים והסוכר עד שמתפח ומבהיר." },
      { order: 4, text: "שלבי בעדינות את תערובת השוקולד עם תערובת הביצים. הוסיפי את הקמח והמלח." },
      { order: 5, text: "מלאי את הרמקינים עד 3/4. אפי בדיוק 12 דקות. הקצוות צריכים להיות יציבים והמרכז עדיין רך." },
      { order: 6, text: "הוציאי, הפכי על צלחת, והגישי מיד עם גלידת וניל." },
    ],
    sapirTips: [
      "קרי תמיד את הזמן בתנור שלך - תנורים שונים זה זה. נסי 11 דקות בפעם הראשונה.",
      "אפשר להכין את התערובת מבעוד מועד ולשמור במקרר עד 24 שעות. תני לרמקינים לעמוד 10 דקות בטמפרטורת חדר לפני האפייה.",
    ],
    kosher: "DAIRY",
    dietTags: [],
    seoTitle: "פונדן שוקולד צרפתי קלאסי | ספיר אלעזרא",
    seoDescription: "פונדן שוקולד עם לבה זורמת, מתכון מקצועי עם תזמון מדויק. למדתי בפריז, בשבילך הביתה.",
    categorySlugs: ["baking", "cakes", "world-cuisines", "french"],
  },
  {
    slug: "sushi-california-beiti",
    title: "סושי קליפורניה ביתי",
    subtitle: "אבוקדו, סרטן וקיוואי, גלגול הפוך",
    heroImage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1600&q=80",
    sapirIntro: "כשעבדתי במסעדה היפנית בטוקיו, השף הראשי לקח חודש שלם ללמד אותי לבשל אורז סושי. הסוד? היחס המדויק של חומץ לאורז וסבלנות.",
    prepTimeMin: 30,
    cookTimeMin: 20,
    totalTimeMin: 60,
    servings: 4,
    difficulty: "MEDIUM",
    ingredients: [
      {
        groupName: "לאורז",
        items: [
          { name: "אורז סושי", quantity: "2", unit: "כוסות" },
          { name: "מים", quantity: "2", unit: "כוסות" },
          { name: "חומץ אורז", quantity: "60", unit: "מ״ל" },
          { name: "סוכר", quantity: "2", unit: "כפות" },
          { name: "מלח", quantity: "1", unit: "כפית" },
        ],
      },
      {
        groupName: "למילוי",
        items: [
          { name: "מקלות סרטן", quantity: "200", unit: "גרם" },
          { name: "אבוקדו בשל", quantity: "1" },
          { name: "מלפפון", quantity: "1" },
          { name: "מיונז יפני", quantity: "3", unit: "כפות" },
          { name: "שומשום שחור ולבן קלוי", quantity: "לפיזור" },
        ],
      },
      {
        groupName: "לעטיפה",
        items: [
          { name: "דפי נורי", quantity: "4" },
          { name: "מחצלת במבוק", quantity: "1" },
        ],
      },
    ],
    steps: [
      { order: 1, text: "שטפי את האורז במים קרים עד שהמים יוצאים צלולים. בשלי לפי הוראות בסיר עם מכסה." },
      { order: 2, text: "ערבבי את החומץ, הסוכר והמלח עד שהסוכר נמס. שפכי על האורז החם וערבבי עם מרית עץ. תני לו להתקרר." },
      { order: 3, text: "פרסי דף נורי על המחצלת. בשכבה דקה, מרחי אורז על כל השטח." },
      { order: 4, text: "הפכי כך שהאורז כלפי מטה. סדרי במרכז את המקל סרטן, רצועות אבוקדו ומלפפון. הוסיפי מיונז." },
      { order: 5, text: "גלגלי בעזרת המחצלת בלחץ אחיד. גלגל הוא הצורה - תני זמן." },
      { order: 6, text: "פזרי שומשום, הרטיבי סכין חדה במים, וחתכי ל-8 חתיכות." },
    ],
    sapirTips: [
      "הקפידי שהאורז יהיה דביק אבל לא רטוב - יחס של 1:1 מים זה המספר הקסום.",
      "הסכין חייבת להיות חדה ורטובה. רטיבי אותה בין כל חיתוך אחרת תקבלי בלגן.",
    ],
    kosher: "PAREVE",
    dietTags: ["דגים"],
    seoTitle: "סושי קליפורניה רול ביתי | ספיר אלעזרא",
    seoDescription: "מתכון סושי קליפורניה ביתי עם אורז סושי מושלם, אבוקדו וסרטן. הוראות מקצועיות שלמדתי במסעדה ביפן.",
    categorySlugs: ["world-cuisines", "japanese"],
  },
  {
    slug: "puree-batata-tinok",
    title: "מחית בטטה ותפוח לתינוק",
    subtitle: "טעימה ראשונה רכה ומתוקה",
    heroImage: "https://images.unsplash.com/photo-1618174149317-e6e87b4ff7ce?auto=format&fit=crop&w=1600&q=80",
    sapirIntro: "המחית הראשונה של התינוק היא רגע מיוחד. אני מעדיפה תמיד לתבל בעדינות עם פרי - בטטה ותפוח עץ הם זוג מנצח.",
    prepTimeMin: 5,
    cookTimeMin: 20,
    totalTimeMin: 25,
    servings: 4,
    difficulty: "EASY",
    ingredients: [
      {
        items: [
          { name: "בטטה בינונית", quantity: "1" },
          { name: "תפוח עץ", quantity: "1" },
          { name: "מים מסוננים", quantity: "לפי הצורך" },
        ],
      },
    ],
    steps: [
      { order: 1, text: "קלפי וחתכי את הבטטה והתפוח לקוביות קטנות." },
      { order: 2, text: "אדי במשך 15-20 דקות עד שהן רכות מאוד. אפשר גם לבשל במים." },
      { order: 3, text: "מעכי במזלג או בבלנדר עם מעט מהמים שנותרו, עד שמגיעים לסמיכות הרצויה." },
      { order: 4, text: "תני לתינוק לטעום בכפית קטנה. אפשר לאחסן במנות במקפיא עד שבועיים." },
    ],
    sapirTips: [
      "שמרי על המחית רכה מאוד עבור 0-6 חודשים. מ-6 חודשים אפשר להשאיר טיפה עם מרקם.",
      "תמיד לטעום בעצמך לפני שמגישה. הטמפרטורה והסמיכות חייבות להיות נכונות.",
    ],
    kosher: "PAREVE",
    dietTags: ["טבעוני", "ללא גלוטן"],
    ageRange: "6-12m",
    seoTitle: "מחית בטטה ותפוח עץ לתינוק | ספיר אלעזרא",
    seoDescription: "מתכון מחית בטטה ותפוח לתינוקות מגיל 6 חודשים. רכה, מתוקה וקלה להכנה. כולל טיפים לאחסון.",
    categorySlugs: ["for-kids", "babies-0-1"],
  },
  {
    slug: "pasta-arabiata",
    title: "פסטה אריביאטה אמיתית",
    subtitle: "ארבעה מצרכים, חמש עשרה דקות, נשמה איטלקית",
    heroImage: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1600&q=80",
    sapirIntro: "אם יש מתכון שגרם לי להבין את עומק הפשטות האיטלקית - זה הוא. ארבעה מצרכים. ארבעה. וטעם של מסעדה.",
    prepTimeMin: 5,
    cookTimeMin: 15,
    totalTimeMin: 20,
    servings: 2,
    difficulty: "EASY",
    ingredients: [
      {
        items: [
          { name: "פנה איכותית", quantity: "200", unit: "גרם" },
          { name: "עגבניות שרי", quantity: "300", unit: "גרם" },
          { name: "שיני שום", quantity: "4" },
          { name: "פלפל אדום חריף", quantity: "1" },
          { name: "שמן זית כתית מעולה", quantity: "4", unit: "כפות" },
          { name: "מלח גס", quantity: "לפי הטעם" },
          { name: "פטרוזיליה קצוצה", quantity: "חופן" },
        ],
      },
    ],
    steps: [
      { order: 1, text: "הביאי סיר גדול עם מים מומלחים מאוד לרתיחה. הוסיפי את הפנה." },
      { order: 2, text: "במחבת רחבה, חממי שמן זית עם השום הקצוץ והפלפל החריף 2 דקות. השום צריך להזהיב, לא להישרף." },
      { order: 3, text: "הוסיפי את עגבניות השרי החצויות. בשלי 5-7 דקות עד שהן מתפוצצות ומשחררות נוזלים." },
      { order: 4, text: "כשנותרו דקה לפנה, העבירי אותה ישר למחבת עם כוס ממי הבישול. ערבבי בעוצמה." },
      { order: 5, text: "המים העמילניים יקשרו את הרוטב לפסטה. המנה מוכנה כשהרוטב נדבק לכל פיסת פסטה." },
      { order: 6, text: "פזרי פטרוזיליה ושמן זית טוב. הגישי מיד." },
    ],
    sapirTips: [
      "מי הפסטה הם הסוד. אל תזרקי אותם - הם הקסם שמחבר רוטב לפסטה.",
      "השתמשי בשמן זית הטוב ביותר שיש לך. כאן הוא לא מתחבא, הוא בכוכבי המנה.",
    ],
    kosher: "PAREVE",
    dietTags: ["טבעוני", "צמחוני"],
    seoTitle: "פסטה אריביאטה איטלקית קלאסית | ספיר אלעזרא",
    seoDescription: "פסטה אריביאטה אמיתית בארבעה מצרכים. רוטב עגבניות חריף עם שום ושמן זית. למדתי באיטליה, מגישה אצלך.",
    categorySlugs: ["world-cuisines", "italian", "israeli-everyday", "ten-minute"],
  },
  {
    slug: "ktzitzot-of-leyladim",
    title: "קציצות עוף לפעוטות",
    subtitle: "רכות, מתוקות, ילדים מבקשים שוב",
    heroImage: "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&w=1600&q=80",
    sapirIntro: "פעוטות יודעים מה הם אוהבים. הקציצות האלה רכות במיוחד, עם נגיעות מתיקות מהבטטה. אצלי הילד מנהל איתן רומן רציני.",
    prepTimeMin: 15,
    cookTimeMin: 25,
    totalTimeMin: 40,
    servings: 6,
    difficulty: "EASY",
    ingredients: [
      {
        items: [
          { name: "חזה עוף טחון", quantity: "500", unit: "גרם" },
          { name: "בטטה אפויה ומעוכה", quantity: "1" },
          { name: "ביצה", quantity: "1" },
          { name: "פירורי לחם", quantity: "3", unit: "כפות" },
          { name: "בצל גרוס דק", quantity: "חצי" },
          { name: "פטרוזיליה קצוצה", quantity: "כף" },
          { name: "מלח", quantity: "חצי כפית" },
          { name: "שמן לאפייה", quantity: "1", unit: "כף" },
        ],
      },
    ],
    steps: [
      { order: 1, text: "חממי תנור ל-180 מעלות. ערבבי בקערה את כל המרכיבים עד אחיד." },
      { order: 2, text: "צרי כדורים בגודל אגוז מלך, שטחי טיפה." },
      { order: 3, text: "סדרי על תבנית עם נייר אפייה, הברישי בשמן." },
      { order: 4, text: "אפי 20-25 דקות עד שהקציצות זהובות וקפיציות למגע." },
      { order: 5, text: "הגישי קצת חמימות עם פירה או אורז." },
    ],
    sapirTips: [
      "הבטטה היא הסוד לרכות. אל תוותרי עליה.",
      "אפשר להכין מראש ולשמור במקפיא עד חודש. לחמם בתנור 10 דקות מקפוא.",
    ],
    kosher: "MEAT",
    dietTags: [],
    ageRange: "1-3y",
    seoTitle: "קציצות עוף רכות לפעוטות | ספיר אלעזרא",
    seoDescription: "מתכון קציצות עוף ובטטה אפויות לפעוטות מגיל שנה. רכות, בריאות וקלות לאכילה. ניתן להקפאה.",
    categorySlugs: ["for-kids", "toddlers-1-5"],
  },
];

async function seed() {
  console.log(`Seeding ${SAMPLES.length} sample recipes...`);
  let created = 0;
  let skipped = 0;
  for (const sample of SAMPLES) {
    const exists = await db.recipe.findUnique({ where: { slug: sample.slug } });
    if (exists) {
      skipped++;
      continue;
    }
    const cats = await db.category.findMany({ where: { slug: { in: sample.categorySlugs } } });
    const { categorySlugs, ...recipeData } = sample;
    void categorySlugs;
    await db.recipe.create({
      data: {
        ...recipeData,
        ingredients: recipeData.ingredients as never,
        steps: recipeData.steps as never,
        galleryImages: [],
        variations: [],
        status: "PUBLISHED",
        publishedAt: new Date(),
        categories: {
          create: cats.map((c) => ({ categoryId: c.id })),
        },
      },
    });
    created++;
  }
  console.log(`Created ${created} recipes, skipped ${skipped} existing.`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

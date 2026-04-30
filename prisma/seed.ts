import { db } from "../lib/db";

const CATEGORIES = [
  {
    slug: "for-kids",
    name: "לילדים",
    children: [
      { slug: "babies-0-1", name: "תינוקות 0-1" },
      { slug: "toddlers-1-5", name: "פעוטות 1-5" },
    ],
  },
  {
    slug: "baking",
    name: "אפייה",
    children: [
      { slug: "breads", name: "לחמים" },
      { slug: "cakes", name: "עוגות" },
      { slug: "pastries", name: "מאפים" },
      { slug: "yeast-doughs", name: "בצקי שמרים" },
    ],
  },
  {
    slug: "grandma-cuisines",
    name: "מטבחי סבתא",
    children: [
      { slug: "moroccan", name: "מרוקאי" },
      { slug: "tripolitan", name: "טריפוליטאי" },
      { slug: "iraqi", name: "עיראקי" },
      { slug: "persian", name: "פרסי" },
      { slug: "yemenite", name: "תימני" },
      { slug: "bukharan", name: "בוכרי" },
    ],
  },
  {
    slug: "world-cuisines",
    name: "מטבח עולמי",
    children: [
      { slug: "french", name: "צרפתי" },
      { slug: "japanese", name: "יפני" },
      { slug: "italian", name: "איטלקי" },
      { slug: "thai", name: "תאילנדי" },
    ],
  },
  {
    slug: "israeli-everyday",
    name: "יומיום ישראלי",
    children: [
      { slug: "friday-dinner", name: "ארוחת שישי" },
      { slug: "holiday", name: "חג" },
      { slug: "ten-minute", name: "עשר דקות" },
      { slug: "meal-prep", name: "הכנה מראש" },
    ],
  },
  {
    slug: "by-diet",
    name: "לפי מצב",
    children: [
      { slug: "vegan", name: "טבעוני" },
      { slug: "gluten-free", name: "ללא גלוטן" },
      { slug: "paleo", name: "פליאו" },
      { slug: "keto", name: "קטו" },
    ],
  },
];

async function seed() {
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const parent = await db.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: i },
      create: { slug: cat.slug, name: cat.name, order: i },
    });
    for (let j = 0; j < cat.children.length; j++) {
      const child = cat.children[j];
      await db.category.upsert({
        where: { slug: child.slug },
        update: { name: child.name, parentId: parent.id, order: j },
        create: { slug: child.slug, name: child.name, parentId: parent.id, order: j },
      });
    }
  }
  const totalChildren = CATEGORIES.reduce((sum, c) => sum + c.children.length, 0);
  console.log(`Seeded ${CATEGORIES.length} top-level categories + ${totalChildren} sub-categories`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

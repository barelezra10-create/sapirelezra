# Sapir Elezra — Recipe Site Design

**Date:** 2026-04-30
**Owner:** Bar Elezra
**Repo:** https://github.com/barelezra10-create/sapirelezra
**Local:** `~/sapirelezra`

## 1. Vision

A Hebrew recipe site for Israelis, written entirely in the voice of **Sapir Elezra** — a fictional, fully-realized chef persona. Sapir is a credentialed culinary chef (French cuisine, Japanese cuisine, baking) with deep grandmother roots (Moroccan, Tripolitan). Her mission: make haute cuisine and authentic ethnic cooking accessible to everyone, including parents cooking for babies and toddlers.

The site has a presence-level persona: an "About" page with her story and (AI-generated) photo, personal intros and tips inside every recipe, but no separate social brand to operate.

## 2. Audience & Tone

- **Audience:** Israeli home cooks, all skill levels. Parents are a key segment.
- **Language:** Hebrew only. RTL layout end-to-end.
- **Tone:** Warm, knowledgeable, encouraging. Day-to-day Hebrew (avoid literary words like ראויה/מתוחכמת/מעודנת/מהפנט). Colloquial but smart. **No em dashes anywhere — ever.**
- **Sapir's voice:** "I learned this from my grandmother in Casablanca, and the same technique works in a Parisian patisserie." Switches naturally between high-end and homey without code-switching feeling forced.

## 3. Categories

### Top-level categories
1. **לילדים** — Babies (0-1) and toddlers (1-5). Allergen tags, texture (puree/finger food/regular), age-appropriate variants.
2. **אפייה** — Breads, cakes, quiches, pancakes, yeast doughs, pastries.
3. **מטבחי סבתא** — Moroccan, Tripolitan, Iraqi, Persian, Yemenite, Bukharan.
4. **מטבח עולמי** — French, Japanese, Italian, Thai, and others added over time.
5. **יומיום ישראלי** — Friday dinner, holiday meals, "10-minute weeknight," meal prep.
6. **לפי מצב** — Vegan, gluten-free, paleo, keto, weight-loss.

### Cross-cutting tags
Prep time, difficulty, kosher status (חלבי/בשרי/פרווה/לא-כשר), meal type (breakfast/lunch/dinner/snack), main ingredient, seasonal.

## 4. Site Architecture

**Public pages:**
- `/` — Hero with Sapir quote + photo, "recipes of the week," top-level category grid, "Sapir's story" teaser, newsletter capture (post-launch).
- `/recipes/[slug]` — Recipe detail page (anatomy below).
- `/categories/[slug]` — Category landing with grid of recipes, sub-filters (sub-category, time, difficulty, kosher, dietary).
- `/categories/לילדים/[age-range]` — Special handling for kids (age range filter).
- `/about` — Sapir's full story, long-form, with hero photo.
- `/search` — Postgres full-text search with filters.
- `/legal/privacy`, `/legal/terms` — Standard.

**Admin pages (`/admin`, password-protected):**
- Recipe list (search, filter, sort, bulk-edit category/tags).
- Recipe edit form (all fields, image upload, preview).
- Category management.
- Image library (browse R2-hosted images, re-attach).
- Generation log viewer (which recipes were generated when, failures, costs).

### Recipe page anatomy
1. Hero image (full-bleed) + title + subtitle.
2. Quick stats bar: prep + cook time, servings, difficulty, kosher, key dietary tags.
3. **"מילה מספיר"** — 2-3 sentence personal intro in her voice.
4. **מצרכים** — grouped (e.g., "לבצק" / "למילוי"), with quantity + unit. "Scale" control to multiply servings.
5. **הוראות** — numbered steps, each with optional inline image. Step text is conversational, not robotic.
6. **טיפים של ספיר** — 1-3 professional tips per recipe (technique, common mistake, pro shortcut).
7. **וריאציות** — substitutions or variations (vegan version, kid-friendly version, kosher swap).
8. Related recipes (4-6, by category + tag overlap).
9. SEO footer (canonical, schema.org Recipe markup).

## 5. Visual Design

**Direction:** "Editorial chef with a soul." NYT Cooking-level cleanliness, but with a single warm accent color and paper-textured backgrounds that prevent the clinical feel.

**Color palette:**
- Accent (primary): Burgundy `#6B1F2A`
- Background (default): Cream/parchment `#F5EFE3`
- Background (alt): Pure white `#FFFFFF` (for recipe content blocks)
- Text (body): Warm black `#1A1410`
- Accent (secondary): Olive green `#5C6B47` (tags, dietary badges)
- Warning/highlight: Mustard `#C8924C`
- Muted text: `#6B5D52`

**Typography (all Google Fonts, Hebrew-supported):**
- Headlines: **Frank Ruhl Libre** — editorial Hebrew serif, magazine feel.
- Body: **Heebo** — clean Hebrew sans-serif, excellent legibility.
- Sapir's personal voice (intros, tips): **Frank Ruhl Libre Italic** — distinctive, intimate.

**Texture & detail:**
- Subtle paper-grain texture on cream backgrounds (very low opacity).
- Thin burgundy hairlines as section dividers.
- Generous whitespace; recipe pages breathe.
- Photography: warm-lit, dramatic, slightly overhead; nano-banana / Imagen prompted for editorial cookbook style.

## 6. Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components by default).
- **Language:** TypeScript strict.
- **Styling:** Tailwind CSS 4 + shadcn/ui components, custom theme tokens.
- **DB:** Postgres on Railway.
- **ORM:** Prisma.
- **Hosting:** Railway (single project: web service + Postgres).
- **Image storage:** Cloudflare R2 (S3-compatible, very cheap egress).
- **Auth (admin):** Simple password-based session via Iron Session or NextAuth Credentials provider. One admin account in env var.
- **Analytics:** Plausible (privacy-friendly, simple) or Cloudflare Web Analytics.
- **Search:** Postgres `tsvector` full-text on Hebrew content (with `unaccent`-equivalent strategy for Hebrew); filters via SQL.

## 7. Data Model (Postgres + Prisma)

```prisma
model Recipe {
  id              String    @id @default(cuid())
  slug            String    @unique
  title           String
  subtitle        String?
  heroImage       String
  galleryImages   String[]
  sapirIntro      String    @db.Text
  prepTimeMin     Int
  cookTimeMin     Int
  totalTimeMin    Int
  servings        Int
  difficulty      Difficulty
  ingredients     Json      // [{ groupName, items: [{ name, quantity, unit, note? }] }]
  steps           Json      // [{ order, text, image? }]
  sapirTips       String[]
  variations      Json?     // [{ title, description }]
  kosher          Kosher
  dietTags        String[]
  ageRange        String?   // for kids: "0-6m", "6-12m", "1-3y", "3-5y"
  seoTitle        String
  seoDescription  String
  status          RecipeStatus @default(DRAFT)
  publishedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  categories      CategoryOnRecipe[]
  tags            TagOnRecipe[]

  @@index([status, publishedAt])
}

model Category {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  parentId  String?
  parent    Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryTree")
  recipes   CategoryOnRecipe[]
  order     Int       @default(0)
}

model CategoryOnRecipe {
  recipe     Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  recipeId   String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String
  @@id([recipeId, categoryId])
}

model Tag {
  id      String  @id @default(cuid())
  slug    String  @unique
  name    String
  recipes TagOnRecipe[]
}

model TagOnRecipe {
  recipe   Recipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  recipeId String
  tag      Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId    String
  @@id([recipeId, tagId])
}

model GenerationJob {
  id          String   @id @default(cuid())
  recipeSlug  String
  status      String   // queued | running | succeeded | failed
  errorMsg    String?
  costUsd     Decimal? @db.Decimal(10, 4)
  startedAt   DateTime @default(now())
  finishedAt  DateTime?
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

enum Kosher {
  DAIRY
  MEAT
  PAREVE
  NOT_KOSHER
}

enum RecipeStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

## 8. Generation Pipeline

A standalone Node script in `scripts/generate-recipes.ts`. Not part of the Next.js runtime.

**Flow per recipe:**
1. Read target list from `scripts/recipe-targets.json` (curated list of 1000 recipe titles + categories).
2. Skip if `recipeSlug` already exists in DB.
3. Call Gemini 2.5 Pro (text generation) with a system prompt that encodes Sapir's voice + structured output schema (matches Recipe fields).
4. Validate response (Zod schema). Retry on failure with smaller temperature.
5. Generate images (Imagen / nano-banana): 1 hero + 2-3 step images. Prompt template uses recipe title + style modifiers ("editorial cookbook photography, warm overhead lighting, on parchment, shallow depth of field").
6. Upload images to R2, store URLs.
7. INSERT recipe row. Mark as `DRAFT` (manual review before publishing).
8. Log job: `GenerationJob` row with cost.

**Cost guardrails:**
- Hard cap on script: $400 max spend (track cumulative cost, abort if exceeded).
- Per-recipe cap: $0.50.
- Resumable: re-running picks up where it left off.

**Voice-quality safeguards:**
- System prompt explicitly bans em dashes (`—`).
- Bans literary Hebrew words from feedback memory (ראויה, מתוחכמת, etc.).
- Includes 3-5 calibration examples (few-shot) of recipes already written in Sapir's voice.
- Post-generation: regex check for banned characters; flag for manual review if found.

## 9. Launch Scope

**Volume:** 500-1000 recipes generated and stored as `DRAFT`. Manual spot-review of 5-10% before flipping to `PUBLISHED`. Bulk-publish in admin once spot-checks pass.

**Distribution target (rough):**
- לילדים: 200 (high-search-volume vertical)
- אפייה: 150
- מטבחי סבתא: 200
- מטבח עולמי: 200
- יומיום ישראלי: 150
- לפי מצב: 100

(Overlap allowed — a recipe can be tagged into multiple categories.)

**Out of scope for v1:**
- User accounts, favorites, ratings, comments.
- Newsletter (will add later).
- Video.
- Multilingual.
- Mobile app.
- Affiliate links / monetization (later).

## 10. SEO

- `<title>` and meta-description per recipe (generated as part of pipeline).
- schema.org/Recipe JSON-LD on every recipe page (ingredients, steps, time, image, ratings placeholder).
- Sitemap auto-generated at `/sitemap.xml`.
- Hebrew-in-URL slugs (URL-encoded Hebrew, hyphenated). Israeli SEO favors native Hebrew slugs over transliteration.
- Canonical URLs, OG tags, Twitter cards.
- Robots.txt, structured breadcrumbs.

## 11. Operational Concerns

- **Backup:** Railway Postgres daily backup; R2 versioning enabled.
- **Cost monitoring:** Railway plan ~$10-20/mo (web + DB). R2 ~$1-5/mo at this scale. Domain TBD.
- **Deploy:** push to main → Railway auto-deploys.
- **Env vars:** `DATABASE_URL`, `GEMINI_API_KEY`, `R2_*` credentials, `ADMIN_PASSWORD`, `SESSION_SECRET`.
- **Hebrew RTL:** root `<html dir="rtl" lang="he">`, Tailwind logical properties, careful with iconography.

## 12. Open Questions (deferred)

- Domain name (will pick before launch).
- Sapir's About-page photo: AI-generated portrait vs. illustrated avatar — will decide after seeing first generations.
- Whether to add a newsletter signup pre-launch (low priority).
- Newsletter provider when added (Klaviyo? Beehiiv?).

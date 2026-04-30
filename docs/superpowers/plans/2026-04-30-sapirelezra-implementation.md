# Sapir Elezra Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Hebrew recipe site with the Sapir Elezra persona, running on Railway with Postgres, populated by 500-1000 AI-generated recipes via Gemini.

**Architecture:** Next.js 16 App Router app, server-rendered, Postgres + Prisma. Public read pages, password-protected admin for editing. Standalone Node script for generation. Cloudflare R2 for images.

**Tech Stack:** Next.js 16 / TypeScript / Tailwind 4 / shadcn/ui / Prisma / Postgres / Iron Session / Cloudflare R2 / Gemini 2.5 Pro + Imagen / Vitest / Playwright

**Spec:** `docs/superpowers/specs/2026-04-30-sapirelezra-design.md`

---

## Phase 1: Foundation (Tasks 1-4)

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`, `.env.example`, `README.md`

- [ ] **Step 1: Initialize Next.js**

```bash
cd ~/sapirelezra
pnpm create next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*" --use-pnpm --no-eslint --skip-install
pnpm install
```

- [ ] **Step 2: Install core dependencies**

```bash
pnpm add @prisma/client zod iron-session
pnpm add -D prisma @types/node tsx vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @playwright/test
```

- [ ] **Step 3: Configure RTL Hebrew root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Heebo } from "next/font/google";
import "./globals.css";

const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-frank",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ספיר אלעזרא | מתכונים מהמטבח שלי",
  description: "שפית מקצועית שמלמדת אותך לבשל בבית. ממטבחי הסבתות שלי ועד צרפת ויפן.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${frankRuhl.variable} ${heebo.variable}`}>
      <body className="bg-cream text-ink font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Set up `.env.example`**

```
DATABASE_URL="postgresql://user:pass@host:5432/sapirelezra"
SESSION_SECRET="generate-32+-char-random-string"
ADMIN_PASSWORD="change-me"
GEMINI_API_KEY=""
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET="sapirelezra-images"
R2_PUBLIC_URL="https://images.sapirelezra.com"
```

- [ ] **Step 5: Verify dev server runs**

Run: `pnpm dev`
Expected: Server starts on http://localhost:3000, page renders with RTL Hebrew metadata.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with RTL Hebrew layout"
```

---

### Task 2: Design tokens + Tailwind theme

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Add CSS custom properties**

Replace `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-burgundy: #6B1F2A;
  --color-burgundy-light: #8C2E3D;
  --color-cream: #F5EFE3;
  --color-cream-dark: #EBE4D3;
  --color-ink: #1A1410;
  --color-ink-muted: #6B5D52;
  --color-olive: #5C6B47;
  --color-mustard: #C8924C;

  --font-display: var(--font-frank), Georgia, serif;
  --font-body: var(--font-heebo), system-ui, sans-serif;
}

:root {
  color-scheme: light;
}

body {
  background-image:
    radial-gradient(circle at 1px 1px, rgba(26, 20, 16, 0.04) 1px, transparent 0);
  background-size: 24px 24px;
}

.prose-sapir {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--color-burgundy);
}

.divider-burgundy {
  border-color: var(--color-burgundy);
  opacity: 0.2;
}
```

- [ ] **Step 2: Verify Tailwind classes work**

Edit `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="container mx-auto px-6 py-16">
      <h1 className="font-display text-6xl text-burgundy">ספיר אלעזרא</h1>
      <p className="prose-sapir text-2xl mt-4">המטבח שלי, פתוח בשבילך.</p>
    </main>
  );
}
```

Run: `pnpm dev`
Expected: Hebrew title in burgundy serif, italic Sapir tagline.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add design tokens and Tailwind theme"
```

---

### Task 3: Prisma schema + initial migration

**Files:**
- Create: `prisma/schema.prisma`, `lib/db.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
pnpm prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Write schema**

Replace `prisma/schema.prisma` with the full schema from the spec (Section 7). Add this generator config at top:

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearchPostgres"]
}
```

(Copy all models, enums, and relations from spec section 7 verbatim.)

- [ ] **Step 3: Set up local Postgres via Docker (or Railway dev DB)**

```bash
docker run -d --name sapirelezra-pg -p 5432:5432 \
  -e POSTGRES_USER=sapir -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=sapirelezra \
  postgres:16
```

Update `.env`:

```
DATABASE_URL="postgresql://sapir:dev@localhost:5432/sapirelezra"
```

- [ ] **Step 4: Run first migration**

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

Expected: Migration created in `prisma/migrations/`, Prisma Client generated.

- [ ] **Step 5: Create db client singleton**

Create `lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- [ ] **Step 6: Smoke test DB connection**

Create `scripts/test-db.ts`:

```ts
import { db } from "../lib/db";

async function main() {
  const count = await db.recipe.count();
  console.log(`Recipes in DB: ${count}`);
  await db.$disconnect();
}

main().catch(console.error);
```

Run: `pnpm tsx scripts/test-db.ts`
Expected: `Recipes in DB: 0`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema and DB client"
```

---

### Task 4: Seed categories

**Files:**
- Create: `prisma/seed.ts`, `scripts/seed-categories.ts`

- [ ] **Step 1: Write category seed data**

Create `prisma/seed.ts`:

```ts
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
  console.log(`Seeded ${CATEGORIES.length} top-level categories`);
}

seed().catch(console.error).finally(() => db.$disconnect());
```

- [ ] **Step 2: Add seed script to package.json**

```json
"scripts": {
  ...
  "db:seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 3: Run seed**

```bash
pnpm db:seed
```

Expected: `Seeded 6 top-level categories`. Verify in DB:

```bash
pnpm prisma studio
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: seed initial categories"
```

---

## Phase 2: Admin (Tasks 5-9)

### Task 5: Admin auth (Iron Session)

**Files:**
- Create: `lib/session.ts`, `app/admin/login/page.tsx`, `app/admin/login/actions.ts`, `app/admin/logout/route.ts`, `middleware.ts`
- Create test: `lib/__tests__/session.test.ts`

- [ ] **Step 1: Configure Iron Session**

Create `lib/session.ts`:

```ts
import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  isAdmin: boolean;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "sapir_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
```

- [ ] **Step 2: Write failing test for login action**

Create `lib/__tests__/session.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { sessionOptions } from "../session";

describe("session config", () => {
  it("uses env-provided secret", () => {
    expect(sessionOptions.cookieName).toBe("sapir_session");
    expect(sessionOptions.cookieOptions?.httpOnly).toBe(true);
  });
});
```

Add `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: [],
  },
});
```

- [ ] **Step 3: Run test**

Run: `SESSION_SECRET=test_test_test_test_test_test_test pnpm vitest run lib/__tests__/session.test.ts`
Expected: PASS

- [ ] **Step 4: Build login page**

Create `app/admin/login/page.tsx`:

```tsx
import { login } from "./actions";

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-cream">
      <form action={login} className="bg-white p-8 rounded-lg shadow w-full max-w-sm space-y-4">
        <h1 className="font-display text-3xl text-burgundy">כניסה לאדמין</h1>
        <input
          type="password"
          name="password"
          required
          placeholder="סיסמה"
          className="w-full border border-cream-dark rounded px-3 py-2"
        />
        <button type="submit" className="w-full bg-burgundy text-cream py-2 rounded">
          כניסה
        </button>
        {/* error banner rendered conditionally based on searchParams */}
      </form>
    </main>
  );
}
```

Create `app/admin/login/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function login(formData: FormData) {
  const password = formData.get("password");
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login?error=1");
  }
  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  redirect("/admin");
}
```

Create `app/admin/logout/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"));
}
```

- [ ] **Step 5: Add middleware to gate `/admin/*`**

Create `middleware.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin/login") || req.nextUrl.pathname.startsWith("/admin/logout")) {
    return NextResponse.next();
  }
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const res = NextResponse.next();
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    if (!session.isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 6: Manual test**

```bash
pnpm dev
```

Visit `http://localhost:3000/admin` → should redirect to `/admin/login`. Enter `ADMIN_PASSWORD` from `.env` → should land on `/admin`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add admin auth via Iron Session"
```

---

### Task 6: Admin recipe list page

**Files:**
- Create: `app/admin/page.tsx`, `app/admin/_components/recipe-table.tsx`

- [ ] **Step 1: Build recipe list page**

Create `app/admin/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { RecipeTable } from "./_components/recipe-table";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const recipes = await db.recipe.findMany({
    where: {
      ...(q && { title: { contains: q, mode: "insensitive" } }),
      ...(status && { status: status as any }),
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { categories: { include: { category: true } } },
  });
  const counts = await db.recipe.groupBy({
    by: ["status"],
    _count: true,
  });
  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-4xl text-burgundy">מתכונים</h1>
        <div className="flex gap-3">
          <Link href="/admin/recipes/new" className="bg-burgundy text-cream px-4 py-2 rounded">
            מתכון חדש
          </Link>
          <form action="/admin/logout" method="POST">
            <button className="text-ink-muted">יציאה</button>
          </form>
        </div>
      </div>
      <div className="flex gap-4 mb-4 text-sm text-ink-muted">
        {counts.map((c) => (
          <span key={c.status}>
            {c.status}: {c._count}
          </span>
        ))}
      </div>
      <form className="mb-6 flex gap-2">
        <input name="q" defaultValue={q} placeholder="חיפוש כותרת" className="border rounded px-3 py-2 flex-1" />
        <select name="status" defaultValue={status} className="border rounded px-3 py-2">
          <option value="">כל הסטטוסים</option>
          <option value="DRAFT">טיוטה</option>
          <option value="PUBLISHED">פורסם</option>
          <option value="ARCHIVED">ארכיון</option>
        </select>
        <button className="bg-cream-dark px-4 rounded">חפש</button>
      </form>
      <RecipeTable recipes={recipes} />
    </main>
  );
}
```

Create `app/admin/_components/recipe-table.tsx`:

```tsx
import Link from "next/link";

type RecipeRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  updatedAt: Date;
  categories: { category: { name: string } }[];
};

export function RecipeTable({ recipes }: { recipes: RecipeRow[] }) {
  if (recipes.length === 0) {
    return <p className="text-ink-muted">אין מתכונים עדיין.</p>;
  }
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-cream-dark">
          <th className="text-right py-2">כותרת</th>
          <th className="text-right py-2">קטגוריות</th>
          <th className="text-right py-2">סטטוס</th>
          <th className="text-right py-2">עודכן</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {recipes.map((r) => (
          <tr key={r.id} className="border-b border-cream-dark">
            <td className="py-3">{r.title}</td>
            <td className="py-3 text-ink-muted">
              {r.categories.map((c) => c.category.name).join(", ")}
            </td>
            <td className="py-3">{r.status}</td>
            <td className="py-3 text-ink-muted">{r.updatedAt.toLocaleDateString("he-IL")}</td>
            <td className="py-3">
              <Link href={`/admin/recipes/${r.id}`} className="text-burgundy">ערוך</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Manual smoke test**

Login → `/admin` should render empty-state message.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: admin recipe list page"
```

---

### Task 7: Admin recipe edit form

**Files:**
- Create: `app/admin/recipes/[id]/page.tsx`, `app/admin/recipes/[id]/actions.ts`, `app/admin/recipes/new/page.tsx`, `lib/recipe-schema.ts`

- [ ] **Step 1: Define Zod schema for recipe input**

Create `lib/recipe-schema.ts`:

```ts
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
```

- [ ] **Step 2: Validation tests**

Create `lib/__tests__/recipe-schema.test.ts`:

```ts
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
```

Run: `pnpm vitest run lib/__tests__/recipe-schema.test.ts`
Expected: All 4 tests pass.

- [ ] **Step 3: Build edit form page**

Create `app/admin/recipes/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { RecipeForm } from "./form";
import { saveRecipe } from "./actions";

export default async function EditRecipe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await db.recipe.findUnique({
    where: { id },
    include: { categories: true, tags: true },
  });
  if (!recipe) notFound();
  const categories = await db.category.findMany({ orderBy: [{ parentId: "asc" }, { order: "asc" }] });
  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="font-display text-4xl text-burgundy mb-6">{recipe.title}</h1>
      <RecipeForm recipe={recipe} categories={categories} action={saveRecipe} />
    </main>
  );
}
```

Create `app/admin/recipes/[id]/form.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";

export function RecipeForm({ recipe, categories, action }: any) {
  const [isPending, startTransition] = useTransition();
  const [json, setJson] = useState(JSON.stringify(recipe, null, 2));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => action(recipe.id, json));
      }}
      className="space-y-4"
    >
      <p className="text-sm text-ink-muted">
        עריכת JSON ישירה (גרסת MVP). שדות מובנים יבואו אחרי בדיקת זרימה.
      </p>
      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        className="w-full font-mono text-xs h-[600px] border rounded p-3"
      />
      <button disabled={isPending} className="bg-burgundy text-cream px-6 py-2 rounded">
        {isPending ? "שומר..." : "שמירה"}
      </button>
    </form>
  );
}
```

Create `app/admin/recipes/[id]/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recipeInputSchema } from "@/lib/recipe-schema";

export async function saveRecipe(id: string, jsonStr: string) {
  const raw = JSON.parse(jsonStr);
  const data = recipeInputSchema.parse(raw);
  const { categoryIds, tagIds, ...recipeData } = data;
  await db.$transaction([
    db.categoryOnRecipe.deleteMany({ where: { recipeId: id } }),
    db.tagOnRecipe.deleteMany({ where: { recipeId: id } }),
    db.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        categories: { create: categoryIds.map((cid) => ({ categoryId: cid })) },
        tags: { create: tagIds.map((tid) => ({ tagId: tid })) },
      },
    }),
  ]);
  revalidatePath("/admin");
  revalidatePath(`/recipes/${data.slug}`);
}
```

- [ ] **Step 4: Build "new recipe" page**

Create `app/admin/recipes/new/page.tsx`:

```tsx
"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function NewRecipe() {
  const recipe = await db.recipe.create({
    data: {
      slug: `draft-${Date.now()}`,
      title: "מתכון חדש",
      heroImage: "https://placehold.co/1200x800?text=Hero",
      sapirIntro: "פסקה אישית של ספיר. החליפי לפני פרסום.",
      prepTimeMin: 0,
      cookTimeMin: 0,
      totalTimeMin: 0,
      servings: 4,
      difficulty: "EASY",
      ingredients: [],
      steps: [],
      sapirTips: [],
      kosher: "PAREVE",
      seoTitle: "מתכון חדש | ספיר אלעזרא",
      seoDescription: "תיאור SEO זמני.",
      status: "DRAFT",
    },
  });
  redirect(`/admin/recipes/${recipe.id}`);
}
```

- [ ] **Step 5: Manual smoke test**

Login → click "מתכון חדש" → JSON editor opens → save → returns to list with new draft.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: admin recipe create + JSON edit form"
```

---

### Task 8: R2 image upload

**Files:**
- Create: `lib/r2.ts`, `app/api/admin/upload/route.ts`
- Modify: `app/admin/recipes/[id]/form.tsx` (add upload UI)

- [ ] **Step 1: Install AWS SDK**

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner nanoid
```

- [ ] **Step 2: Build R2 client**

Create `lib/r2.ts`:

```ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadImage(buffer: Buffer, contentType: string, prefix = "recipes"): Promise<string> {
  const ext = contentType.split("/")[1] ?? "jpg";
  const key = `${prefix}/${nanoid(12)}.${ext}`;
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
```

- [ ] **Step 3: Build upload API route**

Create `app/api/admin/upload/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { uploadImage } from "@/lib/r2";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadImage(buffer, file.type);
  return NextResponse.json({ url });
}
```

- [ ] **Step 4: Add upload widget to form**

Edit `app/admin/recipes/[id]/form.tsx` — add at top of form:

```tsx
async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const { url } = await res.json();
  navigator.clipboard.writeText(url);
  alert(`URL copied: ${url}`);
}

// inside JSX, before textarea:
<label className="block">
  <span className="text-sm">העלאת תמונה (URL ייקופי ללוח):</span>
  <input type="file" accept="image/*" onChange={handleUpload} className="block mt-1" />
</label>
```

- [ ] **Step 5: Test with real R2 credentials**

Set R2 vars in `.env`. Upload a test image. Verify it appears at the public URL.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: R2 image upload from admin"
```

---

### Task 9: Admin layout polish + nav

**Files:**
- Create: `app/admin/layout.tsx`

- [ ] **Step 1: Wrap admin in sidebar layout**

Create `app/admin/layout.tsx`:

```tsx
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-cream-dark">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-display text-2xl text-burgundy">
            ספיר · אדמין
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/admin">מתכונים</Link>
            <Link href="/admin/categories">קטגוריות</Link>
            <Link href="/admin/generation">ייצור AI</Link>
            <form action="/admin/logout" method="POST"><button>יציאה</button></form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: admin shared layout with nav"
```

---

## Phase 3: Public Site (Tasks 10-15)

### Task 10: Public layout + header + footer

**Files:**
- Create: `app/(public)/layout.tsx`, `components/site-header.tsx`, `components/site-footer.tsx`
- Modify: `app/page.tsx` → move to `app/(public)/page.tsx`

- [ ] **Step 1: Move home into public route group**

```bash
mkdir -p app/\(public\)
mv app/page.tsx app/\(public\)/page.tsx
```

- [ ] **Step 2: Build site header**

Create `components/site-header.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";

export async function SiteHeader() {
  const topCategories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
  });
  return (
    <header className="bg-cream border-b divider-burgundy">
      <div className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-3xl text-burgundy">
          ספיר אלעזרא
        </Link>
        <nav className="hidden md:flex gap-6 text-sm">
          {topCategories.map((c) => (
            <Link key={c.id} href={`/categories/${encodeURIComponent(c.slug)}`} className="hover:text-burgundy">
              {c.name}
            </Link>
          ))}
          <Link href="/about" className="hover:text-burgundy">הסיפור שלי</Link>
          <Link href="/search" className="hover:text-burgundy">חיפוש</Link>
        </nav>
      </div>
    </header>
  );
}
```

Create `components/site-footer.tsx`:

```tsx
export function SiteFooter() {
  return (
    <footer className="bg-burgundy text-cream mt-24">
      <div className="container mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="font-display text-2xl mb-3">ספיר אלעזרא</h3>
          <p className="text-cream/80">
            המטבח שלי, פתוח בשבילך. ממטבחי הסבתות שלי ועד צרפת ויפן.
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-3">קישורים</h4>
          <ul className="space-y-1 text-cream/80">
            <li><a href="/about">הסיפור שלי</a></li>
            <li><a href="/search">חיפוש מתכון</a></li>
            <li><a href="/legal/privacy">פרטיות</a></li>
            <li><a href="/legal/terms">תנאי שימוש</a></li>
          </ul>
        </div>
        <div>
          <p className="text-cream/60 text-xs">© {new Date().getFullYear()} כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  );
}
```

Create `app/(public)/layout.tsx`:

```tsx
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: public site layout with header and footer"
```

---

### Task 11: Homepage

**Files:**
- Create: `app/(public)/page.tsx`, `components/recipe-card.tsx`, `components/category-grid.tsx`

- [ ] **Step 1: Build recipe card**

Create `components/recipe-card.tsx`:

```tsx
import Link from "next/link";
import Image from "next/image";

export function RecipeCard({ recipe }: { recipe: { slug: string; title: string; heroImage: string; subtitle?: string | null; totalTimeMin: number } }) {
  return (
    <Link href={`/recipes/${encodeURIComponent(recipe.slug)}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-cream-dark">
        <Image
          src={recipe.heroImage}
          alt={recipe.title}
          width={600}
          height={750}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>
      <h3 className="font-display text-xl mt-3 group-hover:text-burgundy">{recipe.title}</h3>
      {recipe.subtitle && <p className="text-sm text-ink-muted mt-1">{recipe.subtitle}</p>}
      <p className="text-xs text-ink-muted mt-2">{recipe.totalTimeMin} דקות</p>
    </Link>
  );
}
```

- [ ] **Step 2: Build category grid**

Create `components/category-grid.tsx`:

```tsx
import Link from "next/link";

export function CategoryGrid({ categories }: { categories: { slug: string; name: string }[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/categories/${encodeURIComponent(c.slug)}`}
          className="bg-white border border-cream-dark rounded-lg p-6 hover:border-burgundy transition text-center"
        >
          <span className="font-display text-2xl">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Build homepage**

Replace `app/(public)/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { RecipeCard } from "@/components/recipe-card";
import { CategoryGrid } from "@/components/category-grid";

export default async function Home() {
  const [featured, topCategories] = await Promise.all([
    db.recipe.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 8,
    }),
    db.category.findMany({ where: { parentId: null }, orderBy: { order: "asc" } }),
  ]);

  return (
    <main>
      <section className="container mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="font-display text-6xl md:text-8xl text-burgundy leading-tight">
          המטבח שלי, <br />
          פתוח בשבילך.
        </h1>
        <p className="prose-sapir text-2xl mt-6 max-w-2xl mx-auto">
          שפית מקצועית. ממטבחי הסבתות שלי ועד צרפת ויפן. כל מה שלמדתי, אצלך.
        </p>
        <Link href="/about" className="inline-block mt-8 text-burgundy underline">
          הסיפור שלי
        </Link>
      </section>

      <section className="container mx-auto px-6 mb-24">
        <h2 className="font-display text-4xl mb-8">הכי טריים אצלי</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 mb-24">
        <h2 className="font-display text-4xl mb-8">לאיזה מטבח בא לך?</h2>
        <CategoryGrid categories={topCategories} />
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: homepage with hero, featured recipes, category grid"
```

---

### Task 12: Recipe detail page

**Files:**
- Create: `app/(public)/recipes/[slug]/page.tsx`, `components/recipe-jsonld.tsx`, `components/scaling-ingredients.tsx`

- [ ] **Step 1: Build recipe page**

Create `app/(public)/recipes/[slug]/page.tsx`:

```tsx
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ScalingIngredients } from "@/components/scaling-ingredients";
import { RecipeJsonLd } from "@/components/recipe-jsonld";
import { RecipeCard } from "@/components/recipe-card";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const recipe = await db.recipe.findUnique({ where: { slug: decoded } });
  if (!recipe) return {};
  return {
    title: recipe.seoTitle,
    description: recipe.seoDescription,
    openGraph: {
      title: recipe.seoTitle,
      description: recipe.seoDescription,
      images: [recipe.heroImage],
    },
  };
}

export default async function RecipePage({ params }: { params: Params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const recipe = await db.recipe.findUnique({
    where: { slug: decoded, status: "PUBLISHED" },
    include: { categories: { include: { category: true } } },
  });
  if (!recipe) notFound();

  const related = await db.recipe.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: recipe.id },
      categories: {
        some: { categoryId: { in: recipe.categories.map((c) => c.categoryId) } },
      },
    },
    take: 4,
  });

  const ingredients = recipe.ingredients as any[];
  const steps = recipe.steps as any[];

  return (
    <main>
      <RecipeJsonLd recipe={recipe} />

      <section className="relative">
        <div className="aspect-[16/7] relative">
          <Image src={recipe.heroImage} alt={recipe.title} fill className="object-cover" priority />
        </div>
        <div className="container mx-auto px-6 -mt-16 relative">
          <div className="bg-cream rounded-t-lg p-8 md:p-12">
            <h1 className="font-display text-5xl md:text-6xl text-burgundy">{recipe.title}</h1>
            {recipe.subtitle && <p className="text-xl text-ink-muted mt-2">{recipe.subtitle}</p>}

            <div className="flex flex-wrap gap-4 mt-6 text-sm">
              <Stat label="זמן הכנה" value={`${recipe.prepTimeMin} דק'`} />
              <Stat label="זמן בישול" value={`${recipe.cookTimeMin} דק'`} />
              <Stat label="סה״כ" value={`${recipe.totalTimeMin} דק'`} />
              <Stat label="מנות" value={recipe.servings.toString()} />
              <Stat label="רמה" value={diffLabel(recipe.difficulty)} />
              <Stat label="כשרות" value={kosherLabel(recipe.kosher)} />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 my-12">
        <blockquote className="border-r-4 border-burgundy pr-6 py-4 bg-white rounded-lg">
          <p className="prose-sapir text-2xl leading-relaxed">{recipe.sapirIntro}</p>
          <cite className="text-sm text-ink-muted block mt-2">— ספיר</cite>
        </blockquote>
      </section>

      <section className="container mx-auto px-6 grid md:grid-cols-3 gap-12 mb-16">
        <aside className="md:col-span-1">
          <h2 className="font-display text-3xl mb-4">מצרכים</h2>
          <ScalingIngredients groups={ingredients} defaultServings={recipe.servings} />
        </aside>

        <article className="md:col-span-2">
          <h2 className="font-display text-3xl mb-4">הוראות הכנה</h2>
          <ol className="space-y-6">
            {steps.map((s) => (
              <li key={s.order} className="flex gap-4">
                <span className="font-display text-3xl text-burgundy shrink-0">{s.order}</span>
                <div>
                  <p className="text-lg leading-relaxed">{s.text}</p>
                  {s.image && (
                    <Image src={s.image} alt={`שלב ${s.order}`} width={800} height={500} className="mt-3 rounded" />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </article>
      </section>

      {recipe.sapirTips.length > 0 && (
        <section className="bg-burgundy text-cream py-12 my-16">
          <div className="container mx-auto px-6">
            <h2 className="font-display text-3xl mb-6">הטיפים שלי</h2>
            <ul className="space-y-3">
              {recipe.sapirTips.map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-display text-2xl">·</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="container mx-auto px-6 mb-24">
          <h2 className="font-display text-3xl mb-6">מתכונים נוספים שאהבתי</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((r) => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function diffLabel(d: string) {
  return { EASY: "קל", MEDIUM: "בינוני", HARD: "מתקדם" }[d] ?? d;
}
function kosherLabel(k: string) {
  return { DAIRY: "חלבי", MEAT: "בשרי", PAREVE: "פרווה", NOT_KOSHER: "לא כשר" }[k] ?? k;
}
```

- [ ] **Step 2: Build scaling ingredients widget**

Create `components/scaling-ingredients.tsx`:

```tsx
"use client";

import { useState } from "react";

type Item = { name: string; quantity?: string; unit?: string; note?: string };
type Group = { groupName?: string; items: Item[] };

function scaleQuantity(q: string | undefined, factor: number): string | undefined {
  if (!q) return q;
  const n = parseFloat(q.replace(",", "."));
  if (isNaN(n)) return q;
  const scaled = n * factor;
  return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2).replace(/\.?0+$/, "");
}

export function ScalingIngredients({ groups, defaultServings }: { groups: Group[]; defaultServings: number }) {
  const [servings, setServings] = useState(defaultServings);
  const factor = servings / defaultServings;
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setServings(Math.max(1, servings - 1))} className="bg-cream-dark w-8 h-8 rounded">−</button>
        <span className="font-medium">{servings} מנות</span>
        <button onClick={() => setServings(servings + 1)} className="bg-cream-dark w-8 h-8 rounded">+</button>
      </div>
      {groups.map((g, i) => (
        <div key={i} className="mb-4">
          {g.groupName && <h4 className="font-medium text-burgundy mb-2">{g.groupName}</h4>}
          <ul className="space-y-2">
            {g.items.map((item, j) => (
              <li key={j} className="text-sm">
                {item.quantity && <span className="font-medium">{scaleQuantity(item.quantity, factor)} </span>}
                {item.unit && <span>{item.unit} </span>}
                <span>{item.name}</span>
                {item.note && <span className="text-ink-muted"> ({item.note})</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Build JSON-LD component**

Create `components/recipe-jsonld.tsx`:

```tsx
export function RecipeJsonLd({ recipe }: { recipe: any }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.seoDescription,
    image: [recipe.heroImage, ...(recipe.galleryImages ?? [])],
    author: { "@type": "Person", name: "ספיר אלעזרא" },
    prepTime: `PT${recipe.prepTimeMin}M`,
    cookTime: `PT${recipe.cookTimeMin}M`,
    totalTime: `PT${recipe.totalTimeMin}M`,
    recipeYield: `${recipe.servings} מנות`,
    recipeIngredient: (recipe.ingredients as any[]).flatMap((g) =>
      g.items.map((i: any) => `${i.quantity ?? ""} ${i.unit ?? ""} ${i.name}`.trim())
    ),
    recipeInstructions: (recipe.steps as any[]).map((s) => ({
      "@type": "HowToStep",
      text: s.text,
      ...(s.image ? { image: s.image } : {}),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
```

- [ ] **Step 4: Test scaling logic**

Create `components/__tests__/scaling.test.ts`:

```ts
import { describe, it, expect } from "vitest";

function scaleQuantity(q: string | undefined, factor: number): string | undefined {
  if (!q) return q;
  const n = parseFloat(q.replace(",", "."));
  if (isNaN(n)) return q;
  const scaled = n * factor;
  return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2).replace(/\.?0+$/, "");
}

describe("scaleQuantity", () => {
  it("doubles whole numbers", () => {
    expect(scaleQuantity("5", 2)).toBe("10");
  });
  it("handles decimals cleanly", () => {
    expect(scaleQuantity("1.5", 2)).toBe("3");
  });
  it("trims trailing zeros", () => {
    expect(scaleQuantity("1", 1.5)).toBe("1.5");
  });
  it("preserves non-numeric strings", () => {
    expect(scaleQuantity("קמצוץ", 2)).toBe("קמצוץ");
  });
});
```

Run: `pnpm vitest run components/__tests__/scaling.test.ts`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: recipe detail page with scaling ingredients and JSON-LD"
```

---

### Task 13: Category page

**Files:**
- Create: `app/(public)/categories/[slug]/page.tsx`

- [ ] **Step 1: Build category landing**

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { RecipeCard } from "@/components/recipe-card";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const cat = await db.category.findUnique({ where: { slug: decoded } });
  if (!cat) return {};
  return {
    title: `${cat.name} | ספיר אלעזרא`,
    description: `מתכונים בקטגוריה ${cat.name} מהמטבח של ספיר.`,
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const category = await db.category.findUnique({
    where: { slug: decoded },
    include: { children: { orderBy: { order: "asc" } } },
  });
  if (!category) notFound();

  const subIds = category.children.map((c) => c.id);
  const recipes = await db.recipe.findMany({
    where: {
      status: "PUBLISHED",
      categories: {
        some: { categoryId: { in: [category.id, ...subIds] } },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 60,
  });

  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="font-display text-5xl text-burgundy">{category.name}</h1>
      <p className="text-ink-muted mt-2">{recipes.length} מתכונים</p>

      {category.children.length > 0 && (
        <nav className="flex flex-wrap gap-2 mt-6">
          {category.children.map((c) => (
            <a
              key={c.id}
              href={`/categories/${encodeURIComponent(c.slug)}`}
              className="bg-cream-dark px-4 py-1.5 rounded-full text-sm hover:bg-burgundy hover:text-cream"
            >
              {c.name}
            </a>
          ))}
        </nav>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
        {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
      </div>

      {recipes.length === 0 && <p className="text-ink-muted mt-12">אין עדיין מתכונים בקטגוריה הזו.</p>}
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: category landing page"
```

---

### Task 14: Search page

**Files:**
- Create: `app/(public)/search/page.tsx`, `lib/search.ts`
- Modify: `prisma/schema.prisma` (add full-text index migration)

- [ ] **Step 1: Add Postgres full-text helper**

Create `lib/search.ts`:

```ts
import { db } from "./db";
import { Prisma } from "@prisma/client";

export async function searchRecipes(query: string, limit = 40) {
  if (!query.trim()) return [];
  const q = query.trim();
  return db.$queryRaw<
    Array<{ id: string; slug: string; title: string; subtitle: string | null; heroImage: string; totalTimeMin: number }>
  >(Prisma.sql`
    SELECT id, slug, title, subtitle, "heroImage", "totalTimeMin"
    FROM "Recipe"
    WHERE status = 'PUBLISHED'
      AND (title ILIKE ${`%${q}%`} OR "sapirIntro" ILIKE ${`%${q}%`})
    ORDER BY "publishedAt" DESC NULLS LAST
    LIMIT ${limit};
  `);
}
```

(Postgres `tsvector` for Hebrew is non-trivial; ILIKE is good enough for v1 with 1k recipes. Upgrade to GIN+tsvector once volume grows or relevance becomes an issue.)

- [ ] **Step 2: Build search page**

Create `app/(public)/search/page.tsx`:

```tsx
import { searchRecipes } from "@/lib/search";
import { RecipeCard } from "@/components/recipe-card";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = q ? await searchRecipes(q) : [];
  return (
    <main className="container mx-auto px-6 py-12">
      <h1 className="font-display text-5xl text-burgundy mb-6">חיפוש</h1>
      <form className="mb-12">
        <input
          name="q"
          defaultValue={q}
          placeholder="מה מתחשק לך לבשל?"
          autoFocus
          className="w-full text-xl border-b-2 border-burgundy bg-transparent py-3 focus:outline-none"
        />
      </form>
      {q && <p className="text-ink-muted mb-6">{results.length} תוצאות עבור "{q}"</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {results.map((r) => <RecipeCard key={r.id} recipe={r} />)}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: search page with ILIKE-based query"
```

---

### Task 15: About page

**Files:**
- Create: `app/(public)/about/page.tsx`

- [ ] **Step 1: Build About page**

```tsx
import Image from "next/image";

export const metadata = {
  title: "הסיפור של ספיר אלעזרא",
  description: "שפית מקצועית, אמא, וחובבת אוכל שורשי. כל הסיפור.",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-6 py-16 max-w-3xl">
      <h1 className="font-display text-5xl md:text-7xl text-burgundy">שלום, אני ספיר.</h1>

      <div className="aspect-[4/5] relative my-12 rounded-lg overflow-hidden">
        <Image src="https://placehold.co/800x1000?text=Sapir" alt="ספיר אלעזרא" fill className="object-cover" />
      </div>

      <div className="prose-sapir text-2xl leading-relaxed space-y-6">
        <p>
          נולדתי במטבח. הסבתא שלי ציפורה, מקזבלנקה, הייתה מאלצת אותי לטעום כל תבשיל לפני האורחים.
          סבתא רבקה, מטריפולי, הראתה לי איך לעבוד עם בצק כשעוד הייתי קטנה מספיק כדי לשבת על השיש.
        </p>
        <p>
          אחרי הצבא הלכתי ללה קורדון בלו בפריז, ומשם ליפן, שם למדתי שאוכל הוא לא רק טעם.
          חזרתי לישראל עם תיק מלא טכניקות וראש מלא רעיונות.
        </p>
        <p>
          האתר הזה הוא הדבר הכי קרוב שאני יכולה לתת לך לישיבה במטבח שלי. מתכונים שעובדים, טיפים שעובדים,
          ולפעמים גם סיפור קטן מאחורי המנה.
        </p>
        <p className="font-medium">בואי נבשל יחד.</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: About page (Sapir's story)"
```

---

## Phase 4: Generation Pipeline (Tasks 16-20)

### Task 16: Recipe targets list

**Files:**
- Create: `scripts/recipe-targets.json`, `scripts/build-targets.ts`

- [ ] **Step 1: Build initial 1000-recipe target list**

Create `scripts/build-targets.ts`:

```ts
import { writeFileSync } from "fs";
import { join } from "path";

type Target = { title: string; categorySlugs: string[]; tagHints: string[]; ageRange?: string };

const targets: Target[] = [
  // Babies 0-1 (60 recipes)
  { title: "פירה אבוקדו לתינוק", categorySlugs: ["for-kids", "babies-0-1"], tagHints: ["6m+", "vegan"] },
  { title: "פירה תפוח אדמה ובטטה", categorySlugs: ["for-kids", "babies-0-1"], tagHints: ["6m+"] },
  // ... fill with curated list

  // Toddlers 1-5 (140 recipes)
  { title: "כדורי שניצל אפויים", categorySlugs: ["for-kids", "toddlers-1-5"], tagHints: ["finger-food"] },
  // ...

  // Baking (150 recipes)
  { title: "חלה קלאסית", categorySlugs: ["baking", "yeast-doughs"], tagHints: ["friday"] },
  { title: "בריוש קלוע", categorySlugs: ["baking", "yeast-doughs", "world-cuisines", "french"], tagHints: [] },
  // ...

  // Grandma cuisines (200 recipes)
  { title: "חריימה דגים", categorySlugs: ["grandma-cuisines", "tripolitan"], tagHints: ["friday"] },
  { title: "מסבחה", categorySlugs: ["grandma-cuisines", "moroccan"], tagHints: [] },
  { title: "בזין", categorySlugs: ["grandma-cuisines", "tripolitan"], tagHints: [] },
  { title: "קובה סלק עיראקי", categorySlugs: ["grandma-cuisines", "iraqi"], tagHints: [] },
  // ...

  // World (200 recipes)
  { title: "סושי קליפורניה", categorySlugs: ["world-cuisines", "japanese"], tagHints: [] },
  { title: "ראגו אלה בולונייז", categorySlugs: ["world-cuisines", "italian"], tagHints: [] },
  // ...

  // Israeli everyday (150 recipes)
  { title: "שקשוקה קלאסית", categorySlugs: ["israeli-everyday", "ten-minute"], tagHints: ["breakfast"] },
  // ...

  // Diet (100 recipes)
  { title: "פסטה טבעונית בקרם קשיו", categorySlugs: ["by-diet", "vegan"], tagHints: ["pasta"] },
  // ...
];

writeFileSync(
  join(__dirname, "recipe-targets.json"),
  JSON.stringify({ count: targets.length, targets }, null, 2),
  "utf-8"
);
console.log(`Wrote ${targets.length} targets`);
```

- [ ] **Step 2: Use Gemini to flesh out the target list**

Run a one-off script `scripts/expand-targets.ts` that uses Gemini to expand each "stub" category to 150-200 specific recipe titles. The output is appended to `recipe-targets.json`. Curate manually after expansion.

```ts
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

const STUBS = [
  { categorySlug: "babies-0-1", target: 60, prompt: "מתכוני אוכל לתינוקות בגילאי 0-1, תוצאה מובנית ב-JSON" },
  { categorySlug: "toddlers-1-5", target: 140, prompt: "מתכוני אוכל לפעוטות 1-5" },
  // ...
];

async function expand() {
  const out: any[] = JSON.parse(readFileSync(join(__dirname, "recipe-targets.json"), "utf-8")).targets;
  for (const stub of STUBS) {
    const prompt = `תני לי ${stub.target} כותרות מתכון בעברית עבור הקטגוריה "${stub.categorySlug}". פלט JSON: array של {"title": string, "categorySlugs": string[], "tagHints": string[]}. רק כותרות, בלי הסברים.`;
    const res = await model.generateContent(prompt);
    const text = res.response.text();
    const cleaned = text.replace(/```json\n?|```/g, "");
    const arr = JSON.parse(cleaned);
    out.push(...arr);
    console.log(`Added ${arr.length} for ${stub.categorySlug}`);
  }
  writeFileSync(join(__dirname, "recipe-targets.json"), JSON.stringify({ count: out.length, targets: out }, null, 2));
}

expand().catch(console.error);
```

- [ ] **Step 3: Run target generation + manual curation**

```bash
pnpm tsx scripts/build-targets.ts
pnpm add @google/generative-ai
pnpm tsx scripts/expand-targets.ts
```

Then review `recipe-targets.json` manually. Remove duplicates, fix awkward titles, ensure ~1000 total.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: recipe targets list (1000 recipes)"
```

---

### Task 17: Gemini text generation client + Sapir voice prompt

**Files:**
- Create: `lib/gemini.ts`, `lib/sapir-prompt.ts`

- [ ] **Step 1: Build Sapir's system prompt**

Create `lib/sapir-prompt.ts`:

```ts
export const SAPIR_SYSTEM_PROMPT = `
את ספיר אלעזרא, שפית ישראלית מקצועית. הכשרה: לה קורדון בלו (פריז), שולית במסעדה יפנית מסורתית, אפייה צרפתית. שורשים: סבתא ציפורה ממרוקו, סבתא רבקה מטריפולי. את כותבת מתכונים לאתר שלך לציבור הישראלי.

טון:
- חמה, סמכותית, מנוסה. כמו שפית שמדברת לחבר/ה.
- עברית יומיומית. אסור: ראויה, מתוחכמת, מעודנת, מהפנט, נסיכותי.
- בלי קלישאות ("מתכון מנצח", "להתאהב מהביס הראשון").
- אסור בהחלט: מקפים ארוכים (—) או רגילים בתפקיד מבלים. אם צריך הפרדה - פסיק או נקודה.
- "לבישול" ולא "לאיפיון". "תאפי" ולא "אפו". פניה לאישה כברירת מחדל.

מבנה תוכן (תקפיד על כל הסעיפים):
- sapirIntro: 2-3 משפטים אישיים על המתכון. למה את אוהבת אותו, איפה למדת, או טריק בודד.
- ingredients: קבוצות לוגיות (לבצק / למילוי / לקצפת). כמות + יחידה לכל פריט.
- steps: 5-12 שלבים. כל שלב פעולה אחת ברורה. לא רובוטי.
- sapirTips: 1-3 טיפים מקצועיים שמרגישים כמו "סוד מהמטבח".
- variations: וריאציות (טבעוני / ילדים / כשרות אחרת) כשרלוונטי.

פלט: JSON תקף עם השדות המבוקשים בלבד. בלי הקדמה, בלי הסבר. אם משהו מהשדות לא רלוונטי - מערך ריק.
`.trim();
```

- [ ] **Step 2: Build Gemini client**

Create `lib/gemini.ts`:

```ts
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { SAPIR_SYSTEM_PROMPT } from "./sapir-prompt";
import { recipeInputSchema, type RecipeInput } from "./recipe-schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    slug: { type: SchemaType.STRING },
    title: { type: SchemaType.STRING },
    subtitle: { type: SchemaType.STRING },
    sapirIntro: { type: SchemaType.STRING },
    prepTimeMin: { type: SchemaType.INTEGER },
    cookTimeMin: { type: SchemaType.INTEGER },
    totalTimeMin: { type: SchemaType.INTEGER },
    servings: { type: SchemaType.INTEGER },
    difficulty: { type: SchemaType.STRING, enum: ["EASY", "MEDIUM", "HARD"] },
    ingredients: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          groupName: { type: SchemaType.STRING },
          items: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                quantity: { type: SchemaType.STRING },
                unit: { type: SchemaType.STRING },
                note: { type: SchemaType.STRING },
              },
              required: ["name"],
            },
          },
        },
        required: ["items"],
      },
    },
    steps: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          order: { type: SchemaType.INTEGER },
          text: { type: SchemaType.STRING },
        },
        required: ["order", "text"],
      },
    },
    sapirTips: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    variations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
        },
        required: ["title", "description"],
      },
    },
    kosher: { type: SchemaType.STRING, enum: ["DAIRY", "MEAT", "PAREVE", "NOT_KOSHER"] },
    dietTags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    seoTitle: { type: SchemaType.STRING },
    seoDescription: { type: SchemaType.STRING },
  },
  required: ["slug", "title", "sapirIntro", "prepTimeMin", "cookTimeMin", "totalTimeMin", "servings", "difficulty", "ingredients", "steps", "kosher", "seoTitle", "seoDescription"],
};

export async function generateRecipeContent(target: { title: string; categorySlugs: string[]; tagHints: string[]; ageRange?: string }): Promise<Omit<RecipeInput, "heroImage" | "galleryImages" | "categoryIds" | "tagIds" | "ageRange" | "status">> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    systemInstruction: SAPIR_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: responseSchema as any,
      temperature: 0.7,
    },
  });

  const prompt = `כתבי מתכון מלא ל"${target.title}". קטגוריות: ${target.categorySlugs.join(", ")}. רמזים: ${target.tagHints.join(", ") || "אין"}.${target.ageRange ? ` טווח גילאים: ${target.ageRange}.` : ""}`;

  const res = await model.generateContent(prompt);
  const text = res.response.text();
  const raw = JSON.parse(text);

  // Parse + validate (subset of full schema — image fields filled later)
  const partial = {
    ...raw,
    galleryImages: [],
    sapirTips: raw.sapirTips ?? [],
    variations: raw.variations ?? [],
    dietTags: raw.dietTags ?? [],
    heroImage: "https://placehold.co/1200x800",
    categoryIds: [],
    tagIds: [],
    status: "DRAFT",
  };
  recipeInputSchema.parse(partial);
  return raw;
}

export function checkVoiceCompliance(text: string): string[] {
  const issues: string[] = [];
  if (text.includes("—") || text.includes("–")) issues.push("contains em/en dash");
  const banned = ["ראויה", "מתוחכמת", "מעודנת", "מהפנט", "נסיכותי"];
  for (const b of banned) if (text.includes(b)) issues.push(`contains banned word: ${b}`);
  return issues;
}
```

- [ ] **Step 3: Test voice compliance check**

Create `lib/__tests__/gemini.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { checkVoiceCompliance } from "../gemini";

describe("checkVoiceCompliance", () => {
  it("flags em dash", () => {
    expect(checkVoiceCompliance("המתכון הזה — מטורף")).toContain("contains em/en dash");
  });
  it("flags banned words", () => {
    const issues = checkVoiceCompliance("עוגה ראויה ומתוחכמת");
    expect(issues.some((i) => i.includes("ראויה"))).toBe(true);
    expect(issues.some((i) => i.includes("מתוחכמת"))).toBe(true);
  });
  it("passes clean text", () => {
    expect(checkVoiceCompliance("עוגה פשוטה וטעימה")).toEqual([]);
  });
});
```

Run: `pnpm vitest run lib/__tests__/gemini.test.ts`
Expected: 3 tests pass.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: Gemini client + Sapir voice prompt + voice compliance check"
```

---

### Task 18: Image generation with Imagen

**Files:**
- Create: `lib/image-gen.ts`

- [ ] **Step 1: Build image gen helper**

Create `lib/image-gen.ts`:

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { uploadImage } from "./r2";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const STYLE_MODIFIERS = "editorial cookbook photography, warm overhead lighting, on parchment-textured surface, shallow depth of field, natural daylight, no text, no people";

export async function generateRecipeHero(recipeTitle: string, recipeDescription: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });
  const prompt = `${recipeTitle}. ${recipeDescription}. ${STYLE_MODIFIERS}. landscape 16:9.`;
  const result = await (model as any).generateImages({
    prompt,
    config: { numberOfImages: 1, aspectRatio: "16:9" },
  });
  const imageBuffer = Buffer.from(result.images[0].imageBytes, "base64");
  return uploadImage(imageBuffer, "image/jpeg", "recipes/hero");
}

export async function generateRecipeStepImage(stepText: string, recipeTitle: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-002" });
  const prompt = `Step from recipe "${recipeTitle}": ${stepText}. ${STYLE_MODIFIERS}. landscape 16:9.`;
  const result = await (model as any).generateImages({
    prompt,
    config: { numberOfImages: 1, aspectRatio: "16:9" },
  });
  const imageBuffer = Buffer.from(result.images[0].imageBytes, "base64");
  return uploadImage(imageBuffer, "image/jpeg", "recipes/steps");
}
```

(Note: Imagen API surface may shift; if `generateImages` is not available on the JS SDK at the time of building, switch to a direct REST call to `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict`.)

- [ ] **Step 2: Smoke test with one image**

Create `scripts/test-image-gen.ts`:

```ts
import { generateRecipeHero } from "../lib/image-gen";

async function main() {
  const url = await generateRecipeHero("שקשוקה קלאסית", "שקשוקה ברוטב עגבניות עשיר עם ביצים");
  console.log("Generated:", url);
}

main().catch(console.error);
```

Run: `pnpm tsx scripts/test-image-gen.ts`
Expected: Prints an R2 URL. Visit it - should show generated cookbook-style image.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: image generation via Imagen + R2 upload"
```

---

### Task 19: Generation orchestrator

**Files:**
- Create: `scripts/generate-recipes.ts`

- [ ] **Step 1: Build orchestrator**

```ts
import { readFileSync } from "fs";
import { join } from "path";
import { db } from "../lib/db";
import { generateRecipeContent, checkVoiceCompliance } from "../lib/gemini";
import { generateRecipeHero, generateRecipeStepImage } from "../lib/image-gen";

const COST_CAP_USD = 400;
const PER_RECIPE_CAP_USD = 0.5;

// Approximate per-call costs (Gemini 2.5 Pro + Imagen rates as of 2026-04)
const COST_PER_TEXT_GEN = 0.05;
const COST_PER_IMAGE = 0.04;

type Target = { title: string; categorySlugs: string[]; tagHints: string[]; ageRange?: string };

async function totalSpentSoFar(): Promise<number> {
  const result = await db.generationJob.aggregate({
    _sum: { costUsd: true },
    where: { status: "succeeded" },
  });
  return Number(result._sum.costUsd ?? 0);
}

async function alreadyGenerated(slug: string): Promise<boolean> {
  const existing = await db.recipe.findUnique({ where: { slug } });
  return !!existing;
}

function slugify(title: string): string {
  return title.replace(/\s+/g, "-").replace(/[^֐-׿a-z0-9\-]/gi, "").toLowerCase();
}

async function generateOne(target: Target): Promise<void> {
  const candidateSlug = slugify(target.title);
  if (await alreadyGenerated(candidateSlug)) {
    console.log(`Skip (exists): ${target.title}`);
    return;
  }

  const job = await db.generationJob.create({
    data: { recipeSlug: candidateSlug, status: "running" },
  });

  let cost = 0;
  try {
    const content = await generateRecipeContent(target);
    cost += COST_PER_TEXT_GEN;

    const fullText = JSON.stringify(content);
    const issues = checkVoiceCompliance(fullText);
    if (issues.length > 0) {
      console.warn(`Voice issues for ${target.title}:`, issues);
      // Save anyway as DRAFT - manual review will catch
    }

    const heroUrl = await generateRecipeHero(content.title, content.sapirIntro);
    cost += COST_PER_IMAGE;

    const stepImages: Record<number, string> = {};
    const stepsToImage = (content.steps as any[]).slice(0, 3);
    for (const s of stepsToImage) {
      stepImages[s.order] = await generateRecipeStepImage(s.text, content.title);
      cost += COST_PER_IMAGE;
      if (cost > PER_RECIPE_CAP_USD) break;
    }

    const stepsWithImages = (content.steps as any[]).map((s: any) => ({
      ...s,
      ...(stepImages[s.order] ? { image: stepImages[s.order] } : {}),
    }));

    const categories = await db.category.findMany({ where: { slug: { in: target.categorySlugs } } });

    await db.recipe.create({
      data: {
        slug: candidateSlug,
        title: content.title,
        subtitle: content.subtitle ?? null,
        heroImage: heroUrl,
        galleryImages: [],
        sapirIntro: content.sapirIntro,
        prepTimeMin: content.prepTimeMin,
        cookTimeMin: content.cookTimeMin,
        totalTimeMin: content.totalTimeMin,
        servings: content.servings,
        difficulty: content.difficulty,
        ingredients: content.ingredients as any,
        steps: stepsWithImages as any,
        sapirTips: content.sapirTips ?? [],
        variations: (content.variations ?? []) as any,
        kosher: content.kosher,
        dietTags: content.dietTags ?? [],
        ageRange: target.ageRange,
        seoTitle: content.seoTitle,
        seoDescription: content.seoDescription,
        status: "DRAFT",
        categories: {
          create: categories.map((c) => ({ categoryId: c.id })),
        },
      },
    });

    await db.generationJob.update({
      where: { id: job.id },
      data: { status: "succeeded", costUsd: cost, finishedAt: new Date() },
    });
    console.log(`Done: ${target.title} ($${cost.toFixed(2)})`);
  } catch (err: any) {
    await db.generationJob.update({
      where: { id: job.id },
      data: { status: "failed", errorMsg: err.message?.slice(0, 500) ?? "unknown", finishedAt: new Date() },
    });
    console.error(`Failed: ${target.title}: ${err.message}`);
  }
}

async function main() {
  const argLimit = parseInt(process.argv[2] ?? "0", 10);
  const targetsFile = JSON.parse(readFileSync(join(__dirname, "recipe-targets.json"), "utf-8"));
  const targets: Target[] = targetsFile.targets;

  const limit = argLimit > 0 ? argLimit : targets.length;

  for (let i = 0; i < limit; i++) {
    const spent = await totalSpentSoFar();
    if (spent >= COST_CAP_USD) {
      console.error(`Cost cap hit ($${spent.toFixed(2)}). Stopping.`);
      break;
    }
    console.log(`[${i + 1}/${limit}] spent so far: $${spent.toFixed(2)}`);
    await generateOne(targets[i]);
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
```

- [ ] **Step 2: Run a 5-recipe smoke test**

```bash
pnpm tsx scripts/generate-recipes.ts 5
```

Expected: 5 recipes appear as DRAFT. Verify in admin (`/admin`) — open one, sanity-check JSON.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: generation orchestrator with cost caps"
```

---

### Task 20: Voice quality post-check + bulk publish action

**Files:**
- Create: `app/admin/generation/page.tsx`, `app/admin/generation/actions.ts`

- [ ] **Step 1: Build generation dashboard**

```tsx
import { db } from "@/lib/db";
import { publishAllDrafts } from "./actions";

export default async function GenerationPage() {
  const jobs = await db.generationJob.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });
  const draftCount = await db.recipe.count({ where: { status: "DRAFT" } });
  const totalCost = await db.generationJob.aggregate({
    _sum: { costUsd: true },
    where: { status: "succeeded" },
  });
  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="font-display text-4xl text-burgundy mb-6">ייצור AI</h1>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <Stat label="טיוטות ממתינות" value={draftCount} />
        <Stat label="סה״כ עלות" value={`$${(Number(totalCost._sum.costUsd) || 0).toFixed(2)}`} />
        <Stat label="עבודות הצליחו" value={jobs.filter((j) => j.status === "succeeded").length} />
      </div>
      <form action={publishAllDrafts} className="mb-8">
        <button className="bg-burgundy text-cream px-4 py-2 rounded">פרסם את כל הטיוטות</button>
      </form>
      <table className="w-full text-sm">
        <thead><tr><th>סלאג</th><th>סטטוס</th><th>עלות</th><th>שגיאה</th><th>זמן</th></tr></thead>
        <tbody>
          {jobs.map((j) => (
            <tr key={j.id} className="border-b border-cream-dark">
              <td className="py-2">{j.recipeSlug}</td>
              <td>{j.status}</td>
              <td>${(Number(j.costUsd) || 0).toFixed(2)}</td>
              <td className="text-xs text-ink-muted">{j.errorMsg ?? ""}</td>
              <td>{j.startedAt.toLocaleString("he-IL")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return <div className="bg-white p-6 rounded"><dt className="text-sm text-ink-muted">{label}</dt><dd className="text-3xl font-display">{value}</dd></div>;
}
```

Create `app/admin/generation/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function publishAllDrafts() {
  await db.recipe.updateMany({
    where: { status: "DRAFT" },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  revalidatePath("/admin/generation");
  revalidatePath("/admin");
  revalidatePath("/");
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: generation dashboard + bulk publish"
```

---

## Phase 5: Launch (Tasks 21-24)

### Task 21: SEO infrastructure

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`

- [ ] **Step 1: Build sitemap**

Create `app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://sapirelezra.com";
  const recipes = await db.recipe.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });
  const categories = await db.category.findMany({ select: { slug: true } });

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/about`, priority: 0.8 },
    { url: `${baseUrl}/search`, priority: 0.5 },
    ...categories.map((c) => ({
      url: `${baseUrl}/categories/${encodeURIComponent(c.slug)}`,
      priority: 0.7,
    })),
    ...recipes.map((r) => ({
      url: `${baseUrl}/recipes/${encodeURIComponent(r.slug)}`,
      lastModified: r.updatedAt,
      priority: 0.9,
    })),
  ];
}
```

Create `app/robots.ts`:

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${process.env.NEXT_PUBLIC_URL ?? "https://sapirelezra.com"}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Verify**

Run: `pnpm dev` then visit `/sitemap.xml` and `/robots.txt`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: sitemap and robots"
```

---

### Task 22: Railway deploy config

**Files:**
- Create: `railway.json`, `nixpacks.toml`
- Modify: `package.json` (start script + postbuild migrate)

- [ ] **Step 1: Configure build commands**

Update `package.json` scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "prisma generate && next build",
  "start": "prisma migrate deploy && next start -p ${PORT:-3000}",
  "db:seed": "tsx prisma/seed.ts",
  "test": "vitest run",
  "generate-recipes": "tsx scripts/generate-recipes.ts"
}
```

Create `railway.json`:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 60,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

- [ ] **Step 2: Create Railway project**

```bash
# install Railway CLI if not present
brew install railway

cd ~/sapirelezra
railway login
railway init
railway add postgresql
```

- [ ] **Step 3: Set env vars on Railway**

```bash
railway variables --set SESSION_SECRET=$(openssl rand -hex 32)
railway variables --set ADMIN_PASSWORD="<chosen-password>"
railway variables --set GEMINI_API_KEY="<key>"
railway variables --set R2_ACCOUNT_ID="..." R2_ACCESS_KEY_ID="..." R2_SECRET_ACCESS_KEY="..." R2_BUCKET="sapirelezra-images" R2_PUBLIC_URL="https://images.sapirelezra.com"
railway variables --set NEXT_PUBLIC_URL="https://sapirelezra.com"
```

(`DATABASE_URL` is auto-provided by Railway's Postgres plugin.)

- [ ] **Step 4: Push to GitHub and deploy**

```bash
git push -u origin main
railway up
```

Verify deploy: `railway open`. Visit deployed URL → home page should render.

- [ ] **Step 5: Run migrations + seed in production**

```bash
railway run pnpm prisma migrate deploy
railway run pnpm db:seed
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Railway deploy config"
git push
```

---

### Task 23: Cloudflare R2 bucket + production smoke test

**Files:** none (infra only)

- [ ] **Step 1: Create R2 bucket**

In Cloudflare dashboard:
1. R2 → Create bucket: `sapirelezra-images`
2. Settings → Public access → Enable, custom domain `images.sapirelezra.com` (or use the `*.r2.dev` URL temporarily)
3. API tokens → Create R2 API token (Object Read+Write on bucket)
4. Save Account ID, Access Key ID, Secret to env (already in Task 22)

- [ ] **Step 2: Test image upload from production admin**

Visit `https://<railway-url>/admin/login` → login → create new recipe → upload test image. Verify it appears at `https://images.sapirelezra.com/...`.

- [ ] **Step 3: Run a 10-recipe production generation**

```bash
railway run pnpm generate-recipes 10
```

Visit `/admin` → 10 drafts present. Spot-check 3 of them for voice quality and image quality.

- [ ] **Step 4: Commit (env-only changes if any)**

If no file changes, skip. Otherwise:

```bash
git add -A
git commit -m "chore: tune R2 setup"
git push
```

---

### Task 24: Full generation run + launch

- [ ] **Step 1: Spot-check protocol**

Pick 20 random drafts from `/admin`. For each:
- Read sapirIntro: does it sound like Sapir? Banned words?
- Sanity-check ingredient quantities and steps.
- Confirm hero image matches recipe.

If 4+ of 20 fail, halt and tune the prompt. Otherwise proceed.

- [ ] **Step 2: Run full generation**

```bash
railway run pnpm generate-recipes
```

Expected runtime: 4-8 hours. Cost: $200-400. Monitor via `/admin/generation`.

- [ ] **Step 3: Final spot check after run**

Check 30 random recipes across categories. Note any with quality issues for manual editing.

- [ ] **Step 4: Bulk publish**

Visit `/admin/generation` → click "פרסם את כל הטיוטות". Confirm `/` shows recent recipes.

- [ ] **Step 5: Submit sitemap to Google Search Console**

Add property in GSC for the chosen domain → submit `/sitemap.xml`.

- [ ] **Step 6: Tag launch commit**

```bash
git tag v0.1.0-launch
git push --tags
```

---

## Out of scope (post-launch)

- User accounts, favorites, ratings, comments
- Newsletter (Klaviyo or Beehiiv integration)
- Video instructions
- Recipe collections / curated boards
- Multi-language
- Affiliate links / monetization
- Mobile app

---

## Self-review checklist

- [x] Spec section 1 (Vision) → Task 15 (About page) + Task 17 (voice prompt)
- [x] Spec section 2 (Audience/Tone) → Task 17 (voice prompt + compliance check)
- [x] Spec section 3 (Categories) → Task 4 (seed)
- [x] Spec section 4 (Site Architecture) → Tasks 10-15 (public) + Tasks 5-9 (admin)
- [x] Spec section 5 (Visual Design) → Task 2 (theme)
- [x] Spec section 6 (Tech Stack) → Tasks 1, 3, 5, 8, 22
- [x] Spec section 7 (Data Model) → Task 3
- [x] Spec section 8 (Generation Pipeline) → Tasks 16-20
- [x] Spec section 9 (Launch Scope) → Task 24
- [x] Spec section 10 (SEO) → Tasks 12 (JSON-LD), 21 (sitemap/robots)
- [x] Spec section 11 (Operational) → Task 22 (deploy)

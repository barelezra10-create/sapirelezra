import Link from "next/link";
import { db } from "@/lib/db";
import { colorForCategory } from "@/components/category-pill";
import { HeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  const topCategories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
  });
  const cats = topCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    color: colorForCategory(c.slug),
  }));
  return <HeaderClient categories={cats} />;
}

// Keep a minimal default export-friendly skeleton (not used directly).
export function SiteHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 header-blur border-b border-ink/10">
      <div className="container mx-auto px-6 h-16 flex items-center">
        <Link href="/" className="font-body font-black text-2xl tracking-tight text-ink">
          ספיר אלעזרא
        </Link>
      </div>
    </header>
  );
}

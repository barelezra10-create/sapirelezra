import Link from "next/link";
import { db } from "@/lib/db";

export async function SiteHeader() {
  const topCategories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
  });
  return (
    <header className="border-b border-ink/10 bg-cream-warm">
      <div className="border-b border-ink/10 bg-ink text-cream-warm py-2">
        <div className="container mx-auto px-6 flex items-center justify-between text-[11px] tracking-[0.2em] uppercase">
          <span className="opacity-70">גיליון №01 · אביב 2026</span>
          <span className="opacity-70 hidden md:inline">המטבח של ספיר אלעזרא · תל אביב</span>
          <span className="opacity-70">{new Date().toLocaleDateString("he-IL")}</span>
        </div>
      </div>
      <div className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-display text-3xl md:text-4xl text-burgundy leading-none">
          ספיר אלעזרא
        </Link>
        <nav className="hidden md:flex gap-7 text-sm items-center">
          {topCategories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${encodeURIComponent(c.slug)}`}
              className="link-underline hover:text-burgundy transition-colors"
            >
              {c.name}
            </Link>
          ))}
          <span className="w-px h-6 bg-ink/15" />
          <Link href="/about" className="link-underline hover:text-burgundy transition-colors">
            הסיפור שלי
          </Link>
          <Link
            href="/search"
            className="border border-ink/30 px-4 py-2 rounded-full hover:bg-ink hover:text-cream-warm transition-colors text-xs tracking-wider"
          >
            חיפוש מתכון
          </Link>
        </nav>
      </div>
    </header>
  );
}

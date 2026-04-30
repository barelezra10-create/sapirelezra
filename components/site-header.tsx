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
        <nav className="hidden md:flex gap-6 text-sm items-center">
          {topCategories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${encodeURIComponent(c.slug)}`}
              className="hover:text-burgundy"
            >
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

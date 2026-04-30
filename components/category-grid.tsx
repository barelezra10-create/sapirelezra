import Link from "next/link";

type Category = { slug: string; name: string };

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/categories/${encodeURIComponent(c.slug)}`}
          className="bg-white border border-cream-dark rounded-lg p-6 text-center transition hover:border-burgundy"
        >
          <span className="font-display text-2xl">{c.name}</span>
        </Link>
      ))}
    </div>
  );
}

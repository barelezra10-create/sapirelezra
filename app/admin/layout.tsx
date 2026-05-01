import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-cream-dark">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-display text-2xl text-burgundy">
            ספיר · אדמין
          </Link>
          <nav className="flex gap-6 items-center text-sm">
            <Link href="/admin">מתכונים</Link>
            <Link href="/admin/categories" className="text-ink-muted">קטגוריות</Link>
            <Link href="/admin/generation" className="text-ink-muted">ייצור AI</Link>
            <form action="/logout" method="POST">
              <button className="text-ink-muted">יציאה</button>
            </form>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

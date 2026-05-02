import Link from "next/link";
import { db } from "@/lib/db";
import { CategoryPill, colorForCategory } from "@/components/category-pill";

export async function SiteFooter() {
  const topCategories = await db.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
  });
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink-deep text-cream-warm mt-0">
      {/* Top */}
      <div className="container mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-12 gap-y-10 md:gap-10">
          {/* Brand */}
          <div className="col-span-12 md:col-span-4 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-body font-black text-3xl tracking-tight">ספיר</span>
              <span className="font-display italic text-burgundy-light text-2xl">אלעזרא</span>
            </div>
            <p className="text-cream-warm/70 mt-4 leading-relaxed max-w-xs">
              המטבח שלי, פתוח בשבילך. ממטבחי הסבתות שלי ועד צרפת ויפן.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <SocialIcon label="אינסטגרם" href="https://instagram.com">
                <InstagramIcon />
              </SocialIcon>
              <SocialIcon label="פייסבוק" href="https://facebook.com">
                <FacebookIcon />
              </SocialIcon>
              <SocialIcon label="פינטרסט" href="https://pinterest.com">
                <PinterestIcon />
              </SocialIcon>
            </div>
          </div>

          {/* Categories */}
          <div className="col-span-12 sm:col-span-6 md:col-span-4 min-w-0">
            <h4 className="font-body font-bold text-cream-warm mb-4 text-sm tracking-widest uppercase">
              פרקים
            </h4>
            <div className="flex flex-wrap gap-2">
              {topCategories.map((c) => (
                <CategoryPill
                  key={c.id}
                  href={`/categories/${encodeURIComponent(c.slug)}`}
                  label={c.name}
                  color={colorForCategory(c.slug)}
                  size="chip"
                />
              ))}
            </div>
          </div>

          {/* Links + Newsletter */}
          <div className="col-span-12 sm:col-span-6 md:col-span-4 min-w-0">
            <h4 className="font-body font-bold text-cream-warm mb-4 text-sm tracking-widest uppercase">
              ניוזלטר
            </h4>
            <p className="text-cream-warm/70 text-sm leading-relaxed mb-4">
              מתכון אחד, כל יום שני. ישר אצלך.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="כתובת מייל"
                aria-label="כתובת מייל"
                className="search-input bg-cream-warm/10 border-cream-warm/20 text-cream-warm placeholder:text-cream-warm/50 flex-1 min-w-0"
              />
              <button type="submit" className="btn-primary shrink-0">
                הירשמי
              </button>
            </form>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream-warm/70">
              <Link href="/about" className="hover:text-cream-warm">הסיפור שלי</Link>
              <Link href="/search" className="hover:text-cream-warm">חיפוש</Link>
              <Link href="/legal/privacy" className="hover:text-cream-warm">פרטיות</Link>
              <Link href="/legal/terms" className="hover:text-cream-warm">תנאי שימוש</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-cream-warm/10">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-3 text-xs text-cream-warm/55">
          <span>© {year} ספיר אלעזרא. כל הזכויות שמורות.</span>
          <span>נבנה באהבה במטבח, ת״א</span>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 rounded-full border border-cream-warm/20 text-cream-warm/80 hover:bg-cream-warm hover:text-ink-deep flex items-center justify-center transition-colors"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 22v-8h2.5l.5-3H13V8.8c0-.9.3-1.5 1.6-1.5H16V4.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H7v3h2.6v8H13z" />
    </svg>
  );
}
function PinterestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-3.7 19.3c-.1-.8-.2-2 0-2.9l1.3-5.4s-.3-.7-.3-1.7c0-1.5.9-2.7 2-2.7 1 0 1.5.7 1.5 1.6 0 1-.6 2.4-.9 3.7-.3 1.1.6 2.1 1.7 2.1 2.1 0 3.6-2.7 3.6-5.9 0-2.4-1.6-4.2-4.6-4.2-3.4 0-5.5 2.5-5.5 5.3 0 1 .3 1.6.7 2.2.2.2.2.4.2.6l-.2 1c-.1.3-.3.4-.6.3-1.6-.7-2.4-2.5-2.4-4.5 0-3.3 2.8-7.3 8.4-7.3 4.5 0 7.4 3.2 7.4 6.7 0 4.5-2.5 8-6.3 8-1.2 0-2.4-.7-2.8-1.4l-.8 3c-.3 1-.9 2-1.4 2.7A10 10 0 1 0 12 2z" />
    </svg>
  );
}

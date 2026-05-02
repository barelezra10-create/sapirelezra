"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoryPill, type CategoryColor } from "@/components/category-pill";

type Cat = { id: string; name: string; slug: string; color: CategoryColor };

export function HeaderClient({ categories }: { categories: Cat[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("he-IL"));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled ? "shadow-[0_4px_20px_rgba(42,26,14,0.06)] header-blur" : "bg-cream-warm"
      }`}
    >
      {/* Top bar · small dark utility strip */}
      <div className="bg-ink-deep text-cream-warm/80">
        <div className="container mx-auto px-6 h-8 flex items-center justify-between text-[10px] tracking-[0.22em] uppercase">
          <span>גיליון 01 · אביב 2026</span>
          <span className="hidden md:inline">המטבח של ספיר אלעזרא · תל אביב</span>
          <span suppressHydrationWarning>{today || " "}</span>
        </div>
      </div>

      {/* Main bar */}
      <div className="container mx-auto px-6 py-3 md:py-4 flex items-center gap-4 md:gap-6">
        {/* Brand */}
        <Link
          href="/"
          className="shrink-0 flex items-baseline gap-2 group"
        >
          <span className="font-body font-black text-2xl md:text-3xl tracking-tight text-ink leading-none">
            ספיר
          </span>
          <span className="font-display italic text-burgundy text-lg md:text-xl leading-none">
            אלעזרא
          </span>
        </Link>

        {/* Search input · desktop only · spacer pushes actions right */}
        <form action="/search" method="GET" className="hidden md:block flex-1 max-w-xl min-w-0">
          <label className="sr-only" htmlFor="hdr-search">חיפוש מתכון</label>
          <div className="relative">
            <input
              id="hdr-search"
              type="search"
              name="q"
              placeholder="חפשי מתכון... שקשוקה, חלה, פסטה"
              className="search-input pe-10 ps-4"
            />
            <button
              type="submit"
              aria-label="חפש"
              className="absolute inset-y-0 end-2 flex items-center justify-center w-8 h-8 my-auto text-ink-muted hover:text-burgundy transition-colors"
            >
              <SearchIcon />
            </button>
          </div>
        </form>

        {/* Mobile spacer · keeps brand left, actions right */}
        <div className="flex-1 md:hidden" />

        {/* Mobile search shortcut · icon button to /search page */}
        <Link
          href="/search"
          aria-label="חיפוש"
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-ink/15 text-ink hover:bg-ink hover:text-cream-warm transition-colors"
        >
          <SearchIcon />
        </Link>

        {/* Right-side actions (desktop) */}
        <nav className="hidden lg:flex items-center gap-2">
          <Link href="/about" className="pill pill-tomato">הסיפור שלי</Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="תפריט"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-ink/15 text-ink hover:bg-ink hover:text-cream-warm transition-colors"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Category pills row · desktop */}
      <div className="hidden lg:block border-t border-ink/10">
        <div className="container mx-auto px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <CategoryPill
              key={c.id}
              href={`/categories/${encodeURIComponent(c.slug)}`}
              label={c.name}
              color={c.color}
              size="pill"
            />
          ))}
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-ink/10 bg-cream-warm">
          <div className="container mx-auto px-6 py-5 space-y-5">
            {/* Mobile search inside drawer */}
            <form action="/search" method="GET" className="md:hidden">
              <label className="sr-only" htmlFor="hdr-search-mobile">חיפוש מתכון</label>
              <div className="relative">
                <input
                  id="hdr-search-mobile"
                  type="search"
                  name="q"
                  placeholder="חפשי מתכון..."
                  className="search-input pe-10 ps-4"
                />
                <button
                  type="submit"
                  aria-label="חפש"
                  className="absolute inset-y-0 end-2 flex items-center justify-center w-8 h-8 my-auto text-ink-muted hover:text-burgundy transition-colors"
                >
                  <SearchIcon />
                </button>
              </div>
            </form>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <CategoryPill
                  key={c.id}
                  href={`/categories/${encodeURIComponent(c.slug)}`}
                  label={c.name}
                  color={c.color}
                  size="pill"
                />
              ))}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/about"
                className="pill pill-tomato self-start"
                onClick={() => setOpen(false)}
              >
                הסיפור שלי
              </Link>
              <Link
                href="/search"
                className="pill self-start"
                onClick={() => setOpen(false)}
              >
                חיפוש מתקדם
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

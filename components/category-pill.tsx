import Link from "next/link";

export type CategoryColor =
  | "tomato"
  | "marigold"
  | "saffron"
  | "olive"
  | "pistachio"
  | "ink"
  | "cream";

const COLOR_CLASS: Record<CategoryColor, string> = {
  tomato: "chip-tomato",
  marigold: "chip-marigold",
  saffron: "chip-saffron",
  olive: "chip-olive",
  pistachio: "chip-pistachio",
  ink: "chip-ink",
  cream: "chip-cream",
};

/**
 * Map a category slug to a brand color so each top-level category has its own accent.
 * Falls back to "ink" if the slug isn't mapped.
 */
export const CATEGORY_COLOR: Record<string, CategoryColor> = {
  "for-kids": "marigold",
  baking: "saffron",
  "grandma-cuisines": "tomato",
  "world-cuisines": "olive",
  "israeli-everyday": "marigold",
  "by-diet": "pistachio",
};

export function colorForCategory(slug: string): CategoryColor {
  return CATEGORY_COLOR[slug] ?? "ink";
}

type Props = {
  href?: string;
  label: string;
  color?: CategoryColor;
  size?: "chip" | "pill";
  active?: boolean;
};

export function CategoryPill({
  href,
  label,
  color = "ink",
  size = "chip",
  active = false,
}: Props) {
  const base =
    size === "pill"
      ? `pill pill-${color === "ink" ? "tomato" : color}`
      : `chip ${COLOR_CLASS[color]}`;
  const cls = `${base} ${active ? "pill-active" : ""} hover:-translate-y-px transition-transform`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {label}
      </Link>
    );
  }
  return <span className={cls}>{label}</span>;
}

import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "הסיפור של ספיר אלעזרא",
  description: "בשלנית בנשמה. למדתי ממה שהכי חשוב, סבתא מזל. כל הסיפור.",
};

const MILESTONES: Array<{ year: string; text: string }> = [
  { year: "1988", text: "נולדתי במטבח של סבתא מזל" },
  { year: "1995", text: "הראשונה שטעמה כל מה שיוצא מהסירים" },
  { year: "2003", text: "אפיתי את החלה הראשונה לבדי" },
  { year: "2010", text: "התחלתי לרשום מתכונים על מפיות" },
  { year: "2016", text: "פתחתי את הבלוג הראשון" },
  { year: "2020", text: "אמא לראשונה. הקליטה האמיתית התחילה" },
  { year: "2026", text: "האתר הזה" },
];

export default function AboutPage() {
  return (
    <main>
      {/* COVER · bold headline + portrait side by side */}
      <section className="bg-cream-warm">
        <div className="container mx-auto px-6 pt-12 pb-10 md:pt-20 md:pb-16">
          <div className="grid grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="col-span-12 lg:col-span-7 fade-up">
              <span className="chip chip-tomato mb-5">הסיפור של ספיר</span>
              <h1 className="h-display text-ink mt-4">
                שלום,
                <br />
                <span className="voice-sapir not-italic" style={{ fontStyle: "italic" }}>אני ספיר.</span>
              </h1>
              <p className="voice-sapir text-2xl md:text-3xl leading-snug mt-7 max-w-xl">
                בשלנית בנשמה. אמא בפועל. תלמידה של סבתא מזל, עם נטייה לקליל יותר כשאפשר.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-5 fade-up" style={{ animationDelay: "120ms" }}>
              <figure>
                <div className="aspect-[3/4] relative overflow-hidden bg-cream-dark rounded-2xl">
                  <Image
                    src="/sapir/sapir-hero-portrait.png"
                    alt="ספיר אלעזרא במטבח הביתי שלה"
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                    priority
                  />
                </div>
                <figcaption className="mt-3 text-xs tracking-[0.22em] uppercase text-ink-muted text-center">
                  במטבח הביתי, אביב 2026
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* BODY · the start */}
      <section className="bg-section-cream border-t border-ink/10">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <span className="eyebrow eyebrow-burgundy mb-4">פרק 01 · ההתחלה</span>
            <h2 className="h-section mt-2 mb-8">איך זה התחיל</h2>

            <p className="text-lg md:text-xl leading-loose text-ink first-letter:font-body first-letter:font-black first-letter:text-7xl first-letter:text-burgundy first-letter:float-right first-letter:mr-0 first-letter:ml-3 first-letter:leading-none first-letter:mt-1">
              נולדתי במטבח של סבתא מזל. סבתא לא הלכה לבית ספר לבישול ולא קראה ספרי מתכונים. היא ידעה
              את הכל מהבית של אמא שלה, ומאמא של אמא שלה לפניה. כל ילדה שגדלה לידה הייתה צריכה ללמוד
              את המתכונים בעיניים ובידיים. ככה למדתי שתבשיל טוב מתחיל הרבה לפני האש.
            </p>

            <div className="mt-10 columns-1 md:columns-2 gap-12 text-lg leading-loose text-ink [&>p]:mb-6 [&>p]:break-inside-avoid">
              <p>
                לא הלכתי לאקדמיה לבישול. לא עשיתי שוליה במסעדה צרפתית. כל מה שאני יודעת, למדתי מסבתא
                מזל ומכל הניסיונות שלי במטבח הביתי. שגיאות, הצלחות, מתכונים שלא יצאו, ואיטרציות עד
                שיצאו.
              </p>
              <p>
                סבתא מזל לימדה אותי שאוכל הוא לא טכניקה, הוא יחס. איך מתייחסים לבצל, איך לעגבנייה,
                איך למכינה שלך עם אמא של חברה שמראה לך משהו חדש. כל מה שיוצא מהמטבח שלי בא מהמקום הזה.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PULL QUOTE · ink */}
      <section className="bg-section-ink">
        <div className="container mx-auto px-6 py-20 md:py-28 text-center">
          <p className="voice-sapir text-3xl md:text-5xl leading-tight max-w-4xl mx-auto" style={{ color: "var(--color-cream-warm)" }}>
            &ldquo;סבתא מזל לימדה אותי שאוכל זה לא טכניקה. אוכל זה יחס.&rdquo;
          </p>
          <span className="block text-cream-warm/60 text-xs tracking-[0.25em] uppercase mt-8">
            ספיר אלעזרא
          </span>
        </div>
      </section>

      {/* BODY · continuation */}
      <section className="bg-cream-warm">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <span className="eyebrow eyebrow-burgundy mb-4">פרק 02 · הבית</span>
            <h2 className="h-section mt-2 mb-8">היום, אצלי</h2>
            <div className="columns-1 md:columns-2 gap-12 text-lg leading-loose text-ink [&>p]:mb-6 [&>p]:break-inside-avoid">
              <p>
                היום אני אמא ואני מבשלת לילדים שלי כל יום. מהר, פשוט, אבל עם שום פשרה על הטעם. כל מה
                שלמדתי מסבתא מזל, אני מנסה להעביר. בלי קיצורי דרך אבל גם בלי להסתבך יותר ממה שצריך.
              </p>
              <p>
                האתר הזה הוא הדבר הכי קרוב שאני יכולה לתת לך לישיבה במטבח שלי. מתכונים שעובדים בבית
                האמיתי, טיפים שלמדתי משגיאות, ולפעמים סיפור קטן מאחורי המנה. אם פתחת את הדלת, בואי,
                נבשל יחד.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MILESTONES */}
      <section className="bg-section-marigold">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-12 gap-8 md:gap-12">
            <div className="col-span-12 md:col-span-4">
              <span className="eyebrow">ציר זמן</span>
              <h2 className="h-section mt-2">איך הגעתי לכאן</h2>
            </div>
            <div className="col-span-12 md:col-span-8">
              <ol className="divide-y divide-ink/15">
                {MILESTONES.map((m) => (
                  <li
                    key={m.year}
                    className="grid grid-cols-12 gap-6 py-5 items-baseline"
                  >
                    <span className="col-span-3 md:col-span-2 font-body font-black text-2xl md:text-3xl text-ink leading-none">
                      {m.year}
                    </span>
                    <span className="col-span-9 md:col-span-10 font-body text-lg md:text-xl leading-snug text-ink">
                      {m.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="bg-section-tomato">
        <div className="container mx-auto px-6 py-20 md:py-28 text-center">
          <span className="eyebrow eyebrow-cream mb-5">מסיימים את הפרק</span>
          <h2 className="h-section mt-3" style={{ color: "var(--color-cream-warm)" }}>
            המטבח שלי, פתוח בשבילך.
          </h2>
          <p className="text-cream-warm/85 mt-6 max-w-md mx-auto">
            עכשיו את יודעת מאיפה אני באה. בואי נבשל יחד.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/" className="btn-primary bg-cream-warm text-ink border-cream-warm hover:bg-cream">
              לכל המתכונים
            </Link>
            <Link href="/search" className="btn-ghost text-cream-warm border-cream-warm hover:bg-cream-warm hover:text-ink">
              חיפוש מתכון
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

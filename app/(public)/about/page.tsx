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
      {/* COVER — eyebrow + huge title + tagline */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="flex items-center gap-3 mb-12 fade-up">
            <span className="eyebrow eyebrow-burgundy">פרק על · הסיפור של ספיר</span>
            <span className="flex-1 h-px bg-ink/15 draw-line" />
          </div>
          <div className="grid grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="col-span-12 lg:col-span-9 fade-up" style={{ animationDelay: "120ms" }}>
              <h1 className="hero-title text-ink">
                שלום,
                <br />
                <em className="text-burgundy not-italic font-display" style={{ fontStyle: "italic" }}>
                  אני ספיר.
                </em>
              </h1>
            </div>
            <div className="col-span-12 lg:col-span-3 fade-up" style={{ animationDelay: "260ms" }}>
              <p className="prose-sapir text-2xl leading-snug">
                בשלנית בנשמה. אמא בפועל. תלמידה של סבתא מזל.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PORTRAIT */}
      <section className="bg-cream">
        <div className="container mx-auto px-6 py-12 md:py-20">
          <figure className="max-w-2xl mx-auto fade-up">
            <div className="aspect-[3/4] relative overflow-hidden bg-cream-dark">
              <Image
                src="/sapir/sapir-hero-portrait.png"
                alt="ספיר אלעזרא במטבח הביתי שלה"
                fill
                sizes="(max-width: 1024px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
            <figcaption className="mt-4 text-xs tracking-[0.22em] uppercase text-ink-muted text-center italic">
              ספיר במטבח הביתי שלה, אביב 2026
            </figcaption>
          </figure>
        </div>
      </section>

      {/* BODY — long-read, 2-col on desktop */}
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-4xl mx-auto">
            <div className="section-num mb-10">פרק 01 · ההתחלה</div>

            {/* First paragraph with Hebrew drop-cap */}
            <p className="text-lg md:text-xl leading-loose text-ink first-letter:font-display first-letter:text-7xl first-letter:text-burgundy first-letter:float-right first-letter:mr-0 first-letter:ml-3 first-letter:leading-none first-letter:mt-1">
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

      {/* PULL QUOTE — ink background */}
      <section className="bg-ink text-cream-warm">
        <div className="container mx-auto px-6 py-24 md:py-32 text-center">
          <div className="ornament mb-10" />
          <p className="font-display italic text-3xl md:text-5xl leading-snug max-w-4xl mx-auto">
            &ldquo;סבתא מזל לימדה אותי שאוכל זה לא טכניקה. אוכל זה יחס.&rdquo;
          </p>
          <cite className="block text-cream-warm/60 text-xs tracking-[0.25em] uppercase mt-10 not-italic">
            ספיר אלעזרא
          </cite>
          <div className="ornament mt-10" />
        </div>
      </section>

      {/* BODY — continuation */}
      <section className="border-b border-ink/10 bg-cream">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="max-w-4xl mx-auto">
            <div className="section-num mb-10">פרק 02 · הבית</div>
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
      <section className="border-b border-ink/10">
        <div className="container mx-auto px-6 py-24 md:py-32">
          <div className="grid grid-cols-12 gap-8 md:gap-16">
            <div className="col-span-12 md:col-span-4">
              <div className="section-num mb-3">פרק 03 · הציר זמן</div>
              <h2 className="section-title">איך הגעתי לכאן</h2>
            </div>
            <div className="col-span-12 md:col-span-8">
              <ol className="divide-y divide-ink/10">
                {MILESTONES.map((m) => (
                  <li
                    key={m.year}
                    className="grid grid-cols-12 gap-6 py-6 items-baseline"
                  >
                    <span className="col-span-3 md:col-span-2 font-display italic text-2xl md:text-3xl text-burgundy">
                      {m.year}
                    </span>
                    <span className="col-span-9 md:col-span-10 font-display text-xl md:text-2xl leading-snug text-ink">
                      {m.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA — burgundy */}
      <section className="bg-burgundy text-cream-warm">
        <div className="container mx-auto px-6 py-24 md:py-32 text-center">
          <p className="eyebrow eyebrow-cream mb-6">מסיימים את הפרק</p>
          <p className="font-display italic text-4xl md:text-6xl max-w-3xl mx-auto leading-tight">
            המטבח שלי, פתוח בשבילך.
          </p>
          <p className="text-cream-warm/80 mt-8 max-w-md mx-auto">
            עכשיו את יודעת מאיפה אני באה. בואי נבשל יחד.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-cream-warm text-sm tracking-[0.18em] uppercase border-b border-cream-warm/40 pb-1 mt-10 hover:border-cream-warm transition-colors"
          >
            לכל המתכונים
            <span className="text-lg">←</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

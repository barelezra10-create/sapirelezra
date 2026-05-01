import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "הסיפור של ספיר אלעזרא",
  description: "שפית מקצועית, אמא, וחובבת אוכל שורשי. כל הסיפור.",
};

const MILESTONES: Array<{ year: string; text: string }> = [
  { year: "1988", text: "נולדתי בתל אביב" },
  { year: "2005", text: "שוליה ראשונה במטבח צרפתי בנווה צדק" },
  { year: "2010", text: "לה קורדון בלו, פריז" },
  { year: "2013", text: "שוליה במסעדת סושי בטוקיו" },
  { year: "2017", text: "שפית במסעדת ביסטרו צרפתית בלונדון" },
  { year: "2020", text: "חזרה לישראל, אמא ובלוגרית" },
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
                שפית, אמא, וחובבת אוכל שמסרבת לבחור צד.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PORTRAIT */}
      <section className="bg-cream">
        <div className="container mx-auto px-6 py-12 md:py-20">
          <figure className="max-w-4xl mx-auto fade-up">
            <div className="aspect-[4/5] relative overflow-hidden bg-cream-dark img-vignette">
              <Image
                src="https://placehold.co/1200x1500?text=Sapir"
                alt="ספיר אלעזרא"
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
                priority
              />
            </div>
            <figcaption className="mt-4 text-xs tracking-[0.22em] uppercase text-ink-muted text-center italic">
              ספיר במטבח הביתי, חורף 2026
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
              נולדתי במטבח של סבתא ציפורה בשכונת התקווה בתל אביב. היא עלתה מקזבלנקה בשנות החמישים
              עם שני סירי נחושת ומתכונים שאף אחד לא רשם אף פעם. הם היו בראש שלה, וכל ילדה שגדלה
              בתור הבת השלישית הייתה צריכה ללמוד אותם בעיניים. ככה למדתי שתבשיל טוב מתחיל הרבה
              לפני האש.
            </p>

            <div className="mt-10 columns-1 md:columns-2 gap-12 text-lg leading-loose text-ink [&>p]:mb-6 [&>p]:break-inside-avoid">
              <p>
                גיל 17 הצטרפתי למטבח של מסעדה צרפתית קטנה בנווה צדק. השף, ז&apos;אן-לוק, היה נורא
                בעברית ומבריק בבישול. הוא לימד אותי לעבוד מהר, להיות נקייה, ולא לבזבז דבר. שלוש
                שנים אחר כך הייתי בלה קורדון בלו בפריז.
              </p>
              <p>
                אחרי פריז הלכתי ליפן. שנה במסעדת סושי קטנה בטוקיו, איפה שהשף הראשי אמר לי שלוש מילים
                ביום ולא יותר. למדתי על שקט במטבח, על דיוק בחיתוכים, על אורז שמבושל באורך הנכון.
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
            &ldquo;בלה קורדון בלו לימדו אותי טכניקה. במטבח של סבתא ציפורה למדתי נשמה.
            הייתי צריכה את שניהם.&rdquo;
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
                חזרתי לישראל ב-2020 כי רציתי להקים משפחה. היום אני אמא לשני ילדים, ספיר ויובל, ואני
                מבשלת להם כל יום. כל מה שאני יודעת, מהמטבח של סבתא ציפורה ועד טוקיו, אני מנסה
                להעביר. בלי קיצורי דרך אבל גם בלי להסתבך יותר ממה שצריך.
              </p>
              <p>
                האתר הזה הוא הדבר הכי קרוב שאני יכולה לתת לך לישיבה במטבח שלי. מתכונים שעובדים,
                טיפים שלמדתי בדם וזיעה, ולפעמים סיפור קטן מאחורי המנה. אם פתחת את הדלת, בואי, נבשל
                יחד.
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
            השף שלך לרגעי הספק במטבח.
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

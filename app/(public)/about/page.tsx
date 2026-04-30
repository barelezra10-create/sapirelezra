import Image from "next/image";

export const metadata = {
  title: "הסיפור של ספיר אלעזרא",
  description: "שפית מקצועית, אמא, וחובבת אוכל שורשי. כל הסיפור.",
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-6 py-16 max-w-3xl">
      <h1 className="font-display text-5xl md:text-7xl text-burgundy">שלום, אני ספיר.</h1>

      <div className="aspect-[4/5] relative my-12 rounded-lg overflow-hidden bg-cream-dark">
        <Image
          src="https://placehold.co/800x1000?text=Sapir"
          alt="ספיר אלעזרא"
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <div className="prose-sapir text-2xl leading-relaxed space-y-6">
        <p>
          נולדתי במטבח. הסבתא שלי ציפורה, מקזבלנקה, הייתה מאלצת אותי לטעום כל תבשיל לפני האורחים.
          סבתא רבקה, מטריפולי, הראתה לי איך לעבוד עם בצק כשעוד הייתי קטנה מספיק כדי לשבת על השיש.
        </p>
        <p>
          אחרי הצבא הלכתי ללה קורדון בלו בפריז, ומשם ליפן, שם למדתי שאוכל הוא לא רק טעם.
          חזרתי לישראל עם תיק מלא טכניקות וראש מלא רעיונות.
        </p>
        <p>
          האתר הזה הוא הדבר הכי קרוב שאני יכולה לתת לך לישיבה במטבח שלי. מתכונים שעובדים, טיפים שעובדים,
          ולפעמים גם סיפור קטן מאחורי המנה.
        </p>
        <p className="font-medium">בואי נבשל יחד.</p>
      </div>
    </main>
  );
}

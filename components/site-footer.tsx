export function SiteFooter() {
  return (
    <footer className="bg-burgundy text-cream mt-24">
      <div className="container mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="font-display text-2xl mb-3">ספיר אלעזרא</h3>
          <p className="text-cream/80">
            המטבח שלי, פתוח בשבילך. ממטבחי הסבתות שלי ועד צרפת ויפן.
          </p>
        </div>
        <div>
          <h4 className="font-medium mb-3">קישורים</h4>
          <ul className="space-y-1 text-cream/80">
            <li><a href="/about" className="hover:text-cream">הסיפור שלי</a></li>
            <li><a href="/search" className="hover:text-cream">חיפוש מתכון</a></li>
            <li><a href="/legal/privacy" className="hover:text-cream">פרטיות</a></li>
            <li><a href="/legal/terms" className="hover:text-cream">תנאי שימוש</a></li>
          </ul>
        </div>
        <div>
          <p className="text-cream/60 text-xs">
            © {new Date().getFullYear()} כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}

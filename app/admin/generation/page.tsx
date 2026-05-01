import { db } from "@/lib/db";
import { publishAllDrafts, archiveRecipe } from "./actions";

export const dynamic = "force-dynamic";

export default async function GenerationPage() {
  const [jobs, draftCount, publishedCount, totalCost, recentDrafts] = await Promise.all([
    db.generationJob.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
    }),
    db.recipe.count({ where: { status: "DRAFT" } }),
    db.recipe.count({ where: { status: "PUBLISHED" } }),
    db.generationJob.aggregate({
      _sum: { costUsd: true },
      where: { status: "succeeded" },
    }),
    db.recipe.findMany({
      where: { status: "DRAFT" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, slug: true, title: true, createdAt: true },
    }),
  ]);

  const succeededCount = jobs.filter((j) => j.status === "succeeded").length;
  const failedCount = jobs.filter((j) => j.status === "failed").length;
  const totalCostNum = Number(totalCost._sum.costUsd ?? 0);

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="font-display text-4xl text-burgundy mb-6">ייצור AI</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Stat label="טיוטות ממתינות" value={draftCount} />
        <Stat label="פורסם" value={publishedCount} />
        <Stat label="סה״כ עלות" value={`$${totalCostNum.toFixed(2)}`} />
        <Stat label="הצלחות / כשלים (50 אחרונים)" value={`${succeededCount} / ${failedCount}`} />
      </div>

      {draftCount > 0 && (
        <form action={publishAllDrafts} className="mb-8 bg-white border border-cream-dark rounded p-6">
          <h2 className="font-display text-2xl mb-2">פרסום בתפזורת</h2>
          <p className="text-sm text-ink-muted mb-4">
            יפרסם את כל {draftCount} הטיוטות. ודאי שעברת על דגימה לפני.
          </p>
          <button className="bg-burgundy text-cream px-4 py-2 rounded">
            פרסם {draftCount} טיוטות
          </button>
        </form>
      )}

      {recentDrafts.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-2xl mb-3">10 טיוטות אחרונות (לדגימה)</h2>
          <ul className="bg-white border border-cream-dark rounded divide-y divide-cream-dark">
            {recentDrafts.map((d) => (
              <li key={d.id} className="flex items-center justify-between p-3 text-sm">
                <span>{d.title}</span>
                <div className="flex gap-3">
                  <a
                    href={`/admin/recipes/${d.id}`}
                    className="text-burgundy"
                  >
                    ערוך
                  </a>
                  <form action={archiveRecipe.bind(null, d.id)}>
                    <button className="text-ink-muted">ארכיון</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="font-display text-2xl mb-3">לוג עבודות אחרונות</h2>
      <div className="bg-white border border-cream-dark rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream-dark">
            <tr>
              <th className="text-right py-2 px-3">סלאג</th>
              <th className="text-right py-2 px-3">סטטוס</th>
              <th className="text-right py-2 px-3">עלות</th>
              <th className="text-right py-2 px-3">שגיאה</th>
              <th className="text-right py-2 px-3">זמן</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink-muted">
                  עוד אין עבודות.
                </td>
              </tr>
            ) : (
              jobs.map((j) => (
                <tr key={j.id} className="border-t border-cream-dark">
                  <td className="py-2 px-3 font-mono text-xs">{j.recipeSlug}</td>
                  <td className="py-2 px-3">
                    <span
                      className={
                        j.status === "succeeded"
                          ? "text-olive"
                          : j.status === "failed"
                          ? "text-burgundy"
                          : "text-ink-muted"
                      }
                    >
                      {statusHe(j.status)}
                    </span>
                  </td>
                  <td className="py-2 px-3">${(Number(j.costUsd) || 0).toFixed(2)}</td>
                  <td className="py-2 px-3 text-xs text-ink-muted max-w-xs truncate">{j.errorMsg ?? ""}</td>
                  <td className="py-2 px-3 text-xs text-ink-muted">
                    {j.startedAt.toLocaleString("he-IL")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-cream-dark p-6 rounded">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-display text-3xl mt-2">{value}</dd>
    </div>
  );
}

function statusHe(s: string) {
  return ({ succeeded: "הצליח", failed: "נכשל", running: "רץ" } as Record<string, string>)[s] ?? s;
}

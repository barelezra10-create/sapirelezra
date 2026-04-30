import { login } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-cream">
      <form action={login} className="bg-white p-8 rounded-lg shadow w-full max-w-sm space-y-4">
        <h1 className="font-display text-3xl text-burgundy">כניסה לאדמין</h1>
        <input
          type="password"
          name="password"
          required
          placeholder="סיסמה"
          className="w-full border border-cream-dark rounded px-3 py-2"
          autoFocus
        />
        {error && <p className="text-sm text-red-600">סיסמה שגויה</p>}
        <button type="submit" className="w-full bg-burgundy text-cream py-2 rounded">
          כניסה
        </button>
      </form>
    </main>
  );
}

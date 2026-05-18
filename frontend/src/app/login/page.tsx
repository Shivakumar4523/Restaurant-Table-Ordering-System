"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      await signIn({
        email: String(form.get("email")),
        password: String(form.get("password"))
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-gold dark:border-white/10 dark:bg-white/10 lg:grid-cols-2">
        <div className="hidden bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1100&q=82')] bg-cover bg-center lg:block" />
        <form onSubmit={onSubmit} className="p-6 sm:p-10">
          <p className="text-xs font-black uppercase text-royal-600 dark:text-gold-300">Welcome back</p>
          <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Login to Royal Spice</h1>
          <div className="mt-8 grid gap-4">
            <label>
              <span className="text-xs font-black text-stone-600 dark:text-stone-300">Email</span>
              <input
                name="email"
                type="email"
                required
                className="mt-1 h-12 w-full rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-royal-500 dark:border-white/10 dark:bg-stone-950 dark:text-white"
              />
            </label>
            <label>
              <span className="text-xs font-black text-stone-600 dark:text-stone-300">Password</span>
              <input
                name="password"
                type="password"
                required
                className="mt-1 h-12 w-full rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-royal-500 dark:border-white/10 dark:bg-stone-950 dark:text-white"
              />
            </label>
          </div>
          {error ? <p className="mt-4 rounded-[8px] bg-royal-50 p-3 text-sm font-bold text-royal-700">{error}</p> : null}
          <button
            disabled={loading}
            className="tap-target mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-royal-600 px-5 text-sm font-black text-white shadow-glow disabled:opacity-60"
          >
            <LogIn size={18} />
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="mt-5 text-center text-sm text-stone-600 dark:text-stone-300">
            New here?{" "}
            <Link className="font-black text-royal-600 dark:text-gold-300" href="/signup">
              Create account
            </Link>
          </p>
          <p className="mt-3 rounded-[8px] bg-gold-100 p-3 text-xs font-bold text-ink">
            Seeded owner: owner@royalspice.test / owner16655
          </p>
        </form>
      </div>
    </main>
  );
}

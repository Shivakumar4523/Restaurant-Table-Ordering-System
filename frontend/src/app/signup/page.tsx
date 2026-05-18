"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      await signUp({
        name: String(form.get("name")),
        email: String(form.get("email")),
        phone: String(form.get("phone")),
        password: String(form.get("password"))
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <form onSubmit={onSubmit} className="glass w-full max-w-xl rounded-[8px] p-6 shadow-gold sm:p-10">
        <p className="text-xs font-black uppercase text-royal-600 dark:text-gold-300">Create profile</p>
        <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Signup for faster orders.</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-black text-stone-600 dark:text-stone-300">Name</span>
            <input name="name" required className="mt-1 h-12 w-full rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-royal-500 dark:border-white/10 dark:bg-stone-950 dark:text-white" />
          </label>
          <label>
            <span className="text-xs font-black text-stone-600 dark:text-stone-300">Email</span>
            <input name="email" type="email" required className="mt-1 h-12 w-full rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-royal-500 dark:border-white/10 dark:bg-stone-950 dark:text-white" />
          </label>
          <label>
            <span className="text-xs font-black text-stone-600 dark:text-stone-300">Phone</span>
            <input name="phone" className="mt-1 h-12 w-full rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-royal-500 dark:border-white/10 dark:bg-stone-950 dark:text-white" />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-black text-stone-600 dark:text-stone-300">Password</span>
            <input name="password" type="password" minLength={6} required className="mt-1 h-12 w-full rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-royal-500 dark:border-white/10 dark:bg-stone-950 dark:text-white" />
          </label>
        </div>
        {error ? <p className="mt-4 rounded-[8px] bg-royal-50 p-3 text-sm font-bold text-royal-700">{error}</p> : null}
        <button disabled={loading} className="tap-target mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-royal-600 px-5 text-sm font-black text-white shadow-glow disabled:opacity-60">
          <UserPlus size={18} />
          {loading ? "Creating..." : "Create account"}
        </button>
        <p className="mt-5 text-center text-sm text-stone-600 dark:text-stone-300">
          Already have an account?{" "}
          <Link className="font-black text-royal-600 dark:text-gold-300" href="/login">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}

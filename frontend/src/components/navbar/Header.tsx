"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Languages, Moon, ShoppingBag, Sun, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

const links = [
  { href: "/", labelKey: "home" },
  { href: "/menu", labelKey: "menu" },
  { href: "/reserve", labelKey: "reserve" },
  { href: "/dashboard", labelKey: "dashboard" }
] as const;

const adminLink = { href: "/admin", labelKey: "admin" } as const;

export function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const visibleLinks = user?.role === "admin" ? [...links, adminLink] : links;

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-cream/78 backdrop-blur-2xl dark:border-white/10 dark:bg-ink/74">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Royal Spice home">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-royal-600 text-white shadow-glow">
            <ChefHat size={22} />
          </span>
          <span>
            <span className="block text-base font-black leading-4 text-ink dark:text-white">
              Royal Spice
            </span>
            <span className="block text-xs font-semibold text-gold-700 dark:text-gold-300">Kitchen & Bar</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                pathname === link.href
                  ? "bg-royal-600 text-white"
                  : "text-stone-700 hover:bg-white/70 dark:text-stone-200 dark:hover:bg-white/10"
              }`}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className="tap-target grid place-items-center rounded-full border border-black/10 bg-white/70 text-stone-800 shadow-sm transition hover:border-gold-300 dark:border-white/10 dark:bg-white/10 dark:text-white"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            aria-label="Change language"
            title="Change language"
          >
            <Languages size={19} />
          </button>
          <button
            className="tap-target grid place-items-center rounded-full border border-black/10 bg-white/70 text-stone-800 shadow-sm transition hover:border-gold-300 dark:border-white/10 dark:bg-white/10 dark:text-white"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <Link
            href="/cart"
            className="tap-target relative grid place-items-center rounded-full bg-ink text-white shadow-sm transition hover:bg-royal-700 dark:bg-gold-300 dark:text-ink"
            aria-label="Cart"
            title="Cart"
          >
            <ShoppingBag size={19} />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-royal-600 px-1 text-[11px] font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
          <Link
            href={user ? "/dashboard" : "/login"}
            className="tap-target hidden place-items-center rounded-full border border-black/10 bg-white/70 text-stone-800 shadow-sm transition hover:border-gold-300 dark:border-white/10 dark:bg-white/10 dark:text-white sm:grid"
            aria-label="Account"
            title="Account"
          >
            <UserRound size={19} />
          </Link>
        </div>
      </div>
    </header>
  );
}

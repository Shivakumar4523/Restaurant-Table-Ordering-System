"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Home, LayoutDashboard, ShoppingBag, Utensils } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

const items = [
  { href: "/", labelKey: "home", icon: Home },
  { href: "/menu", labelKey: "menu", icon: Utensils },
  { href: "/cart", labelKey: "cart", icon: ShoppingBag },
  { href: "/reserve", labelKey: "reserve", icon: CalendarCheck },
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard }
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { t } = useLanguage();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-white/40 bg-white/88 px-2 py-2 backdrop-blur-2xl dark:border-white/10 dark:bg-ink/90 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex min-h-14 flex-col items-center justify-center rounded-2xl text-[11px] font-bold transition ${
                active
                  ? "bg-royal-600 text-white shadow-glow"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-white/10"
              }`}
            >
              <Icon size={20} />
              <span className="mt-1">{t(labelKey)}</span>
              {href === "/cart" && itemCount > 0 ? (
                <span className="absolute right-4 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-300 px-1 text-[10px] text-ink">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

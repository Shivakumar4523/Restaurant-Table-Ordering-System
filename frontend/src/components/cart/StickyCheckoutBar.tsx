"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/utils/format";

export function StickyCheckoutBar() {
  const { itemCount, total } = useCart();

  if (!itemCount) return null;

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-[72px] z-40 px-4 md:hidden">
      <Link
        href="/checkout"
        className="mx-auto flex max-w-md items-center justify-between rounded-full bg-ink px-5 py-3 text-white shadow-glow dark:bg-gold-300 dark:text-ink"
      >
        <span className="flex items-center gap-2 text-sm font-black">
          <ShoppingBag size={18} />
          {itemCount} item{itemCount > 1 ? "s" : ""}
        </span>
        <span className="text-sm font-black">Checkout {formatMoney(total)}</span>
      </Link>
    </div>
  );
}

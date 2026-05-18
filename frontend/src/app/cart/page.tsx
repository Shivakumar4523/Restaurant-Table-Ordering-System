"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Trash2, Utensils } from "lucide-react";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/utils/format";
import { whatsappOrderLink } from "@/services/api";

export default function CartPage() {
  const {
    items,
    subtotal,
    discount,
    deliveryFee,
    tax,
    total,
    couponMessage,
    removeItem,
    updateQuantity,
    applyCoupon,
    summaryText
  } = useCart();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-royal-600 dark:text-gold-300">Your cart</p>
          <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Review every craving.</h1>
        </div>
        <Link
          href="/menu"
          className="tap-target inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-black text-ink dark:border-white/10 dark:bg-white/10 dark:text-white"
        >
          <Utensils size={17} />
          Add more
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="glass rounded-[8px] p-10 text-center">
          <h2 className="text-2xl font-black text-ink dark:text-white">Your cart is empty</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-300">
            Start with a signature dish, then checkout with Razorpay, UPI, or cash on delivery.
          </p>
          <Link
            href="/menu"
            className="tap-target mt-6 inline-flex items-center justify-center rounded-full bg-royal-600 px-6 text-sm font-black text-white"
          >
            Browse menu
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <section className="space-y-3">
            {items.map((item) => (
              <article key={item._id} className="glass grid grid-cols-[96px_1fr] gap-3 rounded-[8px] p-3 shadow-sm sm:grid-cols-[124px_1fr_auto]">
                <div className="relative h-24 overflow-hidden rounded-[8px] sm:h-28">
                  <Image src={item.image} alt={item.name} fill sizes="140px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-royal-600 dark:text-gold-300">{item.category}</p>
                  <h2 className="mt-1 text-lg font-black text-ink dark:text-white">{item.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600 dark:text-stone-300">{item.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <QuantityStepper value={item.quantity} onChange={(value) => updateQuantity(item._id, value)} />
                    <button
                      className="tap-target inline-flex items-center gap-2 rounded-full px-3 text-sm font-bold text-royal-600 hover:bg-royal-50 dark:text-gold-300 dark:hover:bg-white/10"
                      onClick={() => removeItem(item._id)}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
                <p className="col-span-2 text-right text-lg font-black text-ink dark:text-white sm:col-span-1">
                  {formatMoney(item.price * item.quantity)}
                </p>
              </article>
            ))}
          </section>

          <aside className="glass h-fit rounded-[8px] p-5 shadow-gold lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-ink dark:text-white">Order summary</h2>
            <div className="mt-4 flex gap-2">
              <input
                placeholder="ROYAL10 or GOLD75"
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyCoupon(event.currentTarget.value);
                }}
                className="h-12 min-w-0 flex-1 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold outline-none dark:border-white/10 dark:bg-white/10 dark:text-white"
              />
              <button
                className="tap-target rounded-full bg-gold-300 px-4 text-sm font-black text-ink"
                onClick={(event) => {
                  const input = event.currentTarget.previousElementSibling as HTMLInputElement | null;
                  applyCoupon(input?.value || "");
                }}
              >
                Apply
              </button>
            </div>
            {couponMessage ? <p className="mt-2 text-xs font-bold text-royal-600 dark:text-gold-300">{couponMessage}</p> : null}

            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow label="Subtotal" value={formatMoney(subtotal)} />
              <SummaryRow label="Discount" value={`- ${formatMoney(discount)}`} />
              <SummaryRow label="Delivery" value={deliveryFee ? formatMoney(deliveryFee) : "Free"} />
              <SummaryRow label="Tax" value={formatMoney(tax)} />
              <div className="border-t border-black/10 pt-3 dark:border-white/10">
                <SummaryRow label="Total" value={formatMoney(total)} strong />
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              <Link
                href="/checkout"
                className="tap-target inline-flex items-center justify-center rounded-full bg-royal-600 px-5 text-sm font-black text-white shadow-glow"
              >
                Checkout
              </Link>
              <a
                href={whatsappOrderLink(summaryText())}
                target="_blank"
                rel="noreferrer"
                className="tap-target inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-black text-ink dark:border-white/10 dark:bg-white/10 dark:text-white"
              >
                <MessageCircle size={17} />
                Order on WhatsApp
              </a>
            </div>
          </aside>
        </div>
      )}

      {items.length > 0 ? (
        <div className="safe-bottom fixed inset-x-0 bottom-[72px] z-40 border-t border-white/40 bg-white/92 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-ink/92 md:hidden">
          <Link
            href="/checkout"
            className="mx-auto flex max-w-md items-center justify-between rounded-full bg-royal-600 px-5 py-3 text-sm font-black text-white shadow-glow"
          >
            <span>{items.length} dishes</span>
            <span>Checkout {formatMoney(total)}</span>
          </Link>
        </div>
      ) : null}
    </main>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "text-lg font-black" : "font-semibold"}`}>
      <span className="text-stone-600 dark:text-stone-300">{label}</span>
      <span className="text-ink dark:text-white">{value}</span>
    </div>
  );
}

"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { Banknote, CreditCard, IndianRupee, MapPin, MessageCircle, Smartphone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createOrder, createRazorpayOrder, whatsappOrderLink } from "@/services/api";
import { formatMoney } from "@/utils/format";
import type { Address } from "@/utils/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type PaymentMethod = "razorpay" | "upi" | "cod";

const fields: { key: keyof Address; label: string; required?: boolean }[] = [
  { key: "name", label: "Full name", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "line1", label: "House / flat / street", required: true },
  { key: "line2", label: "Area" },
  { key: "city", label: "City", required: true },
  { key: "state", label: "State", required: true },
  { key: "pincode", label: "Pincode", required: true },
  { key: "landmark", label: "Landmark" }
];

export default function CheckoutPage() {
  const cart = useCart();
  const { token } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [trackId, setTrackId] = useState("");
  const [snapshot, setSnapshot] = useState<{
    items: typeof cart.items;
    subtotal: number;
    discount: number;
    deliveryFee: number;
    tax: number;
    total: number;
  } | null>(null);

  const payloadItems = useMemo(() => cart.items.map((item) => ({ food: item._id, quantity: item.quantity })), [cart.items]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const address = Object.fromEntries(fields.map((field) => [field.key, String(formData.get(field.key) || "")])) as Address;
    const orderSnapshot = {
      items: cart.items,
      subtotal: cart.subtotal,
      discount: cart.discount,
      deliveryFee: cart.deliveryFee,
      tax: cart.tax,
      total: cart.total
    };
    setSnapshot(orderSnapshot);

    try {
      const { order } = await createOrder({
        items: payloadItems,
        address,
        guestName: address.name,
        guestPhone: address.phone,
        paymentMethod,
        couponCode: cart.couponCode
      }, token);

      setTrackId(order._id);

      if (paymentMethod === "razorpay") {
        await handleRazorpay(order._id, address);
      } else {
        setMessage(paymentMethod === "cod" ? "COD order placed." : "UPI order placed. Payment verification is pending.");
      }

      cart.clearCart();
    } catch (error) {
      const localId = `LOCAL-${Date.now()}`;
      setTrackId(localId);
      setMessage(
        error instanceof Error
          ? `${error.message}. Demo order saved locally as ${localId}. Connect the API for real checkout.`
          : `Demo order saved locally as ${localId}.`
      );
      cart.clearCart();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRazorpay(orderId: string, address: Address) {
    const data = await createRazorpayOrder(orderId);

    if (!window.Razorpay) {
      setMessage("Razorpay checkout script is unavailable. Order is placed with payment pending.");
      return;
    }

    new window.Razorpay({
      key: data.key,
      amount: data.razorpayOrder.amount,
      currency: "INR",
      name: "Royal Spice",
      description: "Restaurant order payment",
      order_id: data.razorpayOrder.id,
      prefill: {
        name: address.name,
        contact: address.phone
      },
      theme: {
        color: "#d8232a"
      },
      handler: () => setMessage("Payment captured. Your order is confirmed.")
    }).open();
  }

  const summary = snapshot || cart;

  if (cart.items.length === 0 && !trackId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="glass rounded-[8px] p-10">
          <h1 className="text-3xl font-black text-ink dark:text-white">Nothing to checkout yet</h1>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">Add dishes first, then come back here.</p>
          <Link
            href="/menu"
            className="tap-target mt-6 inline-flex items-center justify-center rounded-full bg-royal-600 px-6 text-sm font-black text-white"
          >
            Open menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="mb-6">
        <p className="text-xs font-black uppercase text-royal-600 dark:text-gold-300">Checkout</p>
        <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Delivery details and payment.</h1>
      </div>

      <form onSubmit={onSubmit} className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <section className="space-y-5">
          <div className="glass rounded-[8px] p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="text-royal-600 dark:text-gold-300" />
              <h2 className="text-xl font-black text-ink dark:text-white">Address</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className={field.key === "line1" ? "sm:col-span-2" : undefined}>
                  <span className="text-xs font-black text-stone-600 dark:text-stone-300">{field.label}</span>
                  <input
                    name={field.key}
                    required={field.required}
                    className="mt-1 h-12 w-full rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none focus:border-royal-500 dark:border-white/10 dark:bg-white/10 dark:text-white"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="glass rounded-[8px] p-5 shadow-sm">
            <h2 className="text-xl font-black text-ink dark:text-white">Payment method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { id: "razorpay", label: "Razorpay", icon: CreditCard },
                { id: "upi", label: "UPI", icon: Smartphone },
                { id: "cod", label: "Cash on Delivery", icon: Banknote }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setPaymentMethod(id as PaymentMethod)}
                  className={`min-h-24 rounded-[8px] border p-4 text-left transition ${
                    paymentMethod === id
                      ? "border-royal-600 bg-royal-50 text-royal-700 dark:border-gold-300 dark:bg-gold-300/15 dark:text-gold-300"
                      : "border-black/10 bg-white text-stone-700 dark:border-white/10 dark:bg-white/10 dark:text-stone-200"
                  }`}
                >
                  <Icon size={22} />
                  <span className="mt-3 block text-sm font-black">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="glass h-fit rounded-[8px] p-5 shadow-gold lg:sticky lg:top-24">
          <h2 className="text-xl font-black text-ink dark:text-white">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            {summary.items.map((item) => (
              <div key={item._id} className="flex justify-between gap-3">
                <span className="text-stone-600 dark:text-stone-300">
                  {item.quantity} x {item.name}
                </span>
                <span className="font-black text-ink dark:text-white">{formatMoney(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-black/10 pt-3 dark:border-white/10">
              <SummaryRow label="Subtotal" value={formatMoney(summary.subtotal)} />
              <SummaryRow label="Discount" value={`- ${formatMoney(summary.discount)}`} />
              <SummaryRow label="Delivery" value={summary.deliveryFee ? formatMoney(summary.deliveryFee) : "Free"} />
              <SummaryRow label="Tax" value={formatMoney(summary.tax)} />
              <SummaryRow label="Total" value={formatMoney(summary.total)} strong />
            </div>
          </div>

          <button
            disabled={submitting}
            className="tap-target mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-royal-600 px-5 text-sm font-black text-white shadow-glow disabled:opacity-60"
          >
            <IndianRupee size={18} />
            {submitting ? "Placing order..." : `Pay ${formatMoney(summary.total)}`}
          </button>
          <a
            href={whatsappOrderLink(cart.summaryText())}
            target="_blank"
            rel="noreferrer"
            className="tap-target mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-black text-ink dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            <MessageCircle size={17} />
            WhatsApp order
          </a>
          {message ? <p className="mt-4 rounded-[8px] bg-gold-100 p-3 text-sm font-bold text-ink">{message}</p> : null}
          {trackId ? (
            <Link
              href={`/track/${trackId}`}
              className="tap-target mt-3 inline-flex w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-black text-white dark:bg-gold-300 dark:text-ink"
            >
              Track order
            </Link>
          ) : null}
        </aside>
      </form>

      <div className="safe-bottom fixed inset-x-0 bottom-[72px] z-40 border-t border-white/40 bg-white/92 px-4 py-3 backdrop-blur-2xl dark:border-white/10 dark:bg-ink/92 md:hidden">
        <button
          onClick={() => document.querySelector("form")?.requestSubmit()}
          disabled={submitting}
          className="mx-auto flex w-full max-w-md items-center justify-between rounded-full bg-royal-600 px-5 py-3 text-sm font-black text-white shadow-glow disabled:opacity-60"
        >
          <span>{paymentMethod.toUpperCase()}</span>
          <span>Place order {formatMoney(summary.total)}</span>
        </button>
      </div>
    </main>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`mt-2 flex items-center justify-between ${strong ? "text-lg font-black" : "font-semibold"}`}>
      <span className="text-stone-600 dark:text-stone-300">{label}</span>
      <span className="text-ink dark:text-white">{value}</span>
    </div>
  );
}

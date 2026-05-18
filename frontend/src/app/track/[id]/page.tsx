"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Clock3, CookingPot, Home, PackageCheck, Truck } from "lucide-react";
import { getOrder } from "@/services/api";
import { compactDate, formatMoney } from "@/utils/format";
import type { Order } from "@/utils/types";

const steps = [
  { id: "placed", label: "Placed", icon: Clock3 },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "preparing", label: "Preparing", icon: CookingPot },
  { id: "out-for-delivery", label: "On the way", icon: Truck },
  { id: "delivered", label: "Delivered", icon: PackageCheck }
];

export default function TrackPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id || "";
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    if (orderId.startsWith("LOCAL-")) {
      setOrder({
        _id: orderId,
        items: [],
        total: 0,
        subtotal: 0,
        discount: 0,
        deliveryFee: 0,
        tax: 0,
        paymentMethod: "cod",
        paymentStatus: "pending",
        status: "placed",
        tracking: [{ status: "placed", message: "Demo order placed locally.", at: new Date().toISOString() }],
        createdAt: new Date().toISOString()
      });
      return;
    }

    let active = true;
    const load = () =>
      getOrder(orderId)
        .then((data) => {
          if (active) setOrder(data.order);
        })
        .catch((err) => {
          if (active) setError(err instanceof Error ? err.message : "Order not found");
        });

    load();
    const interval = window.setInterval(load, 10000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [orderId]);

  const currentIndex = useMemo(() => Math.max(0, steps.findIndex((step) => step.id === order?.status)), [order?.status]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-royal-600 dark:text-gold-300">Live tracking</p>
          <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Track order #{orderId.slice(-6).toUpperCase()}</h1>
        </div>
        <Link href="/" className="tap-target inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-black text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
          <Home size={17} />
          Home
        </Link>
      </div>

      {error ? <p className="glass rounded-[8px] p-5 text-sm font-bold text-royal-600 dark:text-gold-300">{error}</p> : null}

      {!order && !error ? <div className="h-64 animate-pulse rounded-[8px] bg-stone-200/70 dark:bg-white/10" /> : null}

      {order ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <section className="glass rounded-[8px] p-5 shadow-gold">
            <div className="grid gap-4">
              {steps.map((step, index) => {
                const active = index <= currentIndex;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex gap-4">
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${active ? "bg-royal-600 text-white" : "bg-stone-100 text-stone-400 dark:bg-white/10"}`}>
                      <Icon size={22} />
                    </div>
                    <div className="pb-4">
                      <p className={`font-black ${active ? "text-ink dark:text-white" : "text-stone-500"}`}>{step.label}</p>
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                        {active ? "Updated by the restaurant in real time." : "Waiting for the next update."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="glass h-fit rounded-[8px] p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-ink dark:text-white">Order summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Status" value={order.status} />
              <SummaryRow label="Payment" value={`${order.paymentMethod} / ${order.paymentStatus}`} />
              <SummaryRow label="Placed" value={compactDate(order.createdAt)} />
              <SummaryRow label="Total" value={formatMoney(order.total)} />
            </div>
            <div className="mt-5 border-t border-black/10 pt-4 dark:border-white/10">
              <p className="font-black text-ink dark:text-white">Timeline</p>
              <div className="mt-3 space-y-3">
                {order.tracking.map((item, index) => (
                  <div key={`${item.status}-${index}`} className="rounded-[8px] bg-white/70 p-3 text-sm dark:bg-white/10">
                    <p className="font-black text-ink dark:text-white">{item.status}</p>
                    <p className="mt-1 text-stone-600 dark:text-stone-300">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-bold text-stone-600 dark:text-stone-300">{label}</span>
      <span className="text-right font-black text-ink dark:text-white">{value}</span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, LogOut, MapPin, PackageCheck, Settings, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getMine } from "@/services/api";
import { compactDate, formatMoney } from "@/utils/format";
import type { Order } from "@/utils/types";

export default function DashboardPage() {
  const { user, token, logout, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pushMessage, setPushMessage] = useState("");

  useEffect(() => {
    if (token) getMine(token).then((data) => setOrders(data.orders)).catch(() => setOrders([]));
  }, [token]);

  async function enablePush() {
    if (!("Notification" in window)) {
      setPushMessage("This browser does not support push notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    setPushMessage(permission === "granted" ? "Push notifications enabled for this device." : "Push permission was not granted.");
  }

  if (loading) {
    return <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">Loading profile...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto grid min-h-[60svh] max-w-3xl place-items-center px-4 py-10 text-center sm:px-6 lg:px-8">
        <div className="glass rounded-[8px] p-10">
          <UserRound className="mx-auto text-royal-600 dark:text-gold-300" size={36} />
          <h1 className="mt-4 text-3xl font-black text-ink dark:text-white">Login for your dashboard</h1>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">See order history, saved addresses, and profile settings.</p>
          <Link href="/login" className="tap-target mt-6 inline-flex items-center justify-center rounded-full bg-royal-600 px-6 text-sm font-black text-white">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-royal-600 dark:text-gold-300">Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Good to see you, {user.name}.</h1>
        </div>
        <button onClick={logout} className="tap-target inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-black text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
          <LogOut size={17} />
          Logout
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="space-y-5">
          <div className="glass rounded-[8px] p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="text-royal-600 dark:text-gold-300" />
              <h2 className="text-xl font-black text-ink dark:text-white">Profile settings</h2>
            </div>
            <div className="space-y-3 text-sm">
              <ProfileRow label="Name" value={user.name} />
              <ProfileRow label="Email" value={user.email} />
              <ProfileRow label="Phone" value={user.phone || "Not added"} />
              <ProfileRow label="Role" value={user.role} />
            </div>
          </div>

          <div className="glass rounded-[8px] p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="text-royal-600 dark:text-gold-300" />
              <h2 className="text-xl font-black text-ink dark:text-white">Saved addresses</h2>
            </div>
            {user.addresses?.length ? (
              <div className="space-y-3">
                {user.addresses.map((address, index) => (
                  <div key={index} className="rounded-[8px] border border-black/10 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/10">
                    <p className="font-black text-ink dark:text-white">{address.name}</p>
                    <p className="mt-1 text-stone-600 dark:text-stone-300">{address.line1}, {address.city}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-600 dark:text-stone-300">Saved addresses will appear after checkout.</p>
            )}
          </div>

          <div className="glass rounded-[8px] p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BellRing className="text-royal-600 dark:text-gold-300" />
              <h2 className="text-xl font-black text-ink dark:text-white">Push notifications</h2>
            </div>
            <button onClick={enablePush} className="tap-target rounded-full bg-gold-300 px-5 text-sm font-black text-ink">
              Enable updates
            </button>
            {pushMessage ? <p className="mt-3 text-sm font-bold text-royal-600 dark:text-gold-300">{pushMessage}</p> : null}
          </div>
        </section>

        <section className="glass rounded-[8px] p-5 shadow-gold">
          <div className="mb-4 flex items-center gap-2">
            <PackageCheck className="text-royal-600 dark:text-gold-300" />
            <h2 className="text-xl font-black text-ink dark:text-white">Order history</h2>
          </div>
          {orders.length ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link key={order._id} href={`/track/${order._id}`} className="block rounded-[8px] border border-black/10 bg-white p-4 transition hover:border-royal-500 dark:border-white/10 dark:bg-white/10">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-ink dark:text-white">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{compactDate(order.createdAt)} | {order.status}</p>
                    </div>
                    <p className="font-black text-royal-600 dark:text-gold-300">{formatMoney(order.total)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[8px] border border-dashed border-black/20 p-8 text-center dark:border-white/20">
              <p className="font-black text-ink dark:text-white">No orders yet</p>
              <Link href="/menu" className="tap-target mt-4 inline-flex items-center justify-center rounded-full bg-royal-600 px-5 text-sm font-black text-white">
                Place first order
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[8px] bg-white/70 p-3 dark:bg-white/10">
      <span className="font-bold text-stone-600 dark:text-stone-300">{label}</span>
      <span className="font-black text-ink dark:text-white">{value}</span>
    </div>
  );
}

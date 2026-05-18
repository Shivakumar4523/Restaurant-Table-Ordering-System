"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Edit3, ImagePlus, Package, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { deleteFood, getAdminAnalytics, getAdminOrders, getFoods, saveFoodForm, updateOrderStatus } from "@/services/api";
import { categories } from "@/utils/sample-data";
import { compactDate, formatMoney } from "@/utils/format";
import type { Food, Order } from "@/utils/types";
import type { AdminAnalytics } from "@/services/api";

const foodCategories = categories.filter((category) => category !== "All");

export default function AdminPage() {
  const { user, token, loading } = useAuth();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [editing, setEditing] = useState<Food | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || user?.role !== "admin") return;

    Promise.all([
      getAdminAnalytics(token).catch(() => null),
      getAdminOrders(token).catch(() => ({ orders: [] })),
      getFoods().catch(() => [])
    ]).then(([analyticsData, orderData, foodData]) => {
      setAnalytics(analyticsData);
      setOrders(orderData?.orders || []);
      setFoods(foodData);
    });
  }, [token, user?.role]);

  async function submitFood(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const form = new FormData(event.currentTarget);
    form.set("isFeatured", form.get("isFeatured") ? "true" : "false");
    form.set("isAvailable", "true");

    try {
      await saveFoodForm(token, form, editing?._id);
      setMessage(editing ? "Dish updated." : "Dish added.");
      setEditing(null);
      event.currentTarget.reset();
      setFoods(await getFoods());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save dish");
    }
  }

  async function removeFood(food: Food) {
    if (!token) return;
    await deleteFood(token, food._id);
    setFoods((current) => current.filter((item) => item._id !== food._id));
    setMessage(`${food.name} deleted.`);
  }

  async function changeStatus(order: Order, status: string) {
    if (!token) return;
    const data = await updateOrderStatus(token, order._id, status);
    setOrders((current) => current.map((item) => (item._id === order._id ? data.order : item)));
  }

  if (loading) {
    return <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">Checking admin access...</main>;
  }

  if (!user || user.role !== "admin") {
    return (
      <main className="mx-auto grid min-h-[60svh] max-w-3xl place-items-center px-4 py-10 text-center sm:px-6 lg:px-8">
        <div className="glass rounded-[8px] p-10">
          <h1 className="text-3xl font-black text-ink dark:text-white">Admin login required</h1>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">Login with the seeded admin account or create an admin user in MongoDB.</p>
          <Link href="/login" className="tap-target mt-6 inline-flex items-center justify-center rounded-full bg-royal-600 px-6 text-sm font-black text-white">
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-black uppercase text-royal-600 dark:text-gold-300">Admin panel</p>
        <h1 className="mt-2 text-3xl font-black text-ink dark:text-white">Manage the restaurant.</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Orders", value: analytics?.summary?.orders || orders.length },
          { label: "Revenue", value: formatMoney(analytics?.summary?.revenue || 0) },
          { label: "Foods", value: analytics?.summary?.foods || foods.length },
          { label: "Reservations", value: analytics?.summary?.reservations || 0 }
        ].map((item) => (
          <div key={item.label} className="glass rounded-[8px] p-5 shadow-sm">
            <BarChart3 className="text-royal-600 dark:text-gold-300" />
            <p className="mt-4 text-sm font-bold text-stone-600 dark:text-stone-300">{item.label}</p>
            <p className="mt-1 text-2xl font-black text-ink dark:text-white">{item.value}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-5 xl:grid-cols-[420px_1fr]">
        <section className="glass h-fit rounded-[8px] p-5 shadow-gold xl:sticky xl:top-24">
          <div className="mb-4 flex items-center gap-2">
            <ImagePlus className="text-royal-600 dark:text-gold-300" />
            <h2 className="text-xl font-black text-ink dark:text-white">{editing ? "Edit dish" : "Add food"}</h2>
          </div>
          <form key={editing?._id || "new-food"} onSubmit={submitFood} className="grid gap-3">
            <input name="name" defaultValue={editing?.name} placeholder="Dish name" required className="h-12 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-stone-950 dark:text-white" />
            <textarea name="description" defaultValue={editing?.description} placeholder="Description" required rows={3} className="rounded-[8px] border border-black/10 bg-white p-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-stone-950 dark:text-white" />
            <div className="grid grid-cols-2 gap-3">
              <select name="category" defaultValue={editing?.category || "Veg"} className="h-12 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-stone-950 dark:text-white">
                {foodCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <input name="price" defaultValue={editing?.price} type="number" min="0" placeholder="Price" required className="h-12 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-stone-950 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input name="rating" defaultValue={editing?.rating || 4.6} type="number" min="0" max="5" step="0.1" placeholder="Rating" className="h-12 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-stone-950 dark:text-white" />
              <input name="prepTime" defaultValue={editing?.prepTime || 20} type="number" min="1" placeholder="Prep time" className="h-12 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-stone-950 dark:text-white" />
            </div>
            <input name="image" defaultValue={editing?.image} placeholder="Image URL" className="h-12 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold outline-none dark:border-white/10 dark:bg-stone-950 dark:text-white" />
            <label className="rounded-[8px] border border-dashed border-black/20 bg-white/60 p-3 text-sm font-bold text-stone-700 dark:border-white/20 dark:bg-white/10 dark:text-stone-200">
              Upload image
              <input name="imageFile" type="file" accept="image/*" className="mt-2 block w-full text-xs" />
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-bold text-stone-700 dark:text-stone-200">
              <input name="isFeatured" type="checkbox" defaultChecked={editing?.isFeatured} />
              Featured dish
            </label>
            <div className="flex gap-2">
              <button className="tap-target inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-royal-600 px-5 text-sm font-black text-white">
                <Plus size={17} />
                {editing ? "Update" : "Add"}
              </button>
              {editing ? (
                <button type="button" onClick={() => setEditing(null)} className="tap-target rounded-full border border-black/10 bg-white px-5 text-sm font-black text-ink dark:border-white/10 dark:bg-white/10 dark:text-white">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
          {message ? <p className="mt-4 rounded-[8px] bg-gold-100 p-3 text-sm font-bold text-ink">{message}</p> : null}
        </section>

        <section className="space-y-5">
          <div className="glass rounded-[8px] p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Package className="text-royal-600 dark:text-gold-300" />
              <h2 className="text-xl font-black text-ink dark:text-white">Manage orders</h2>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 8).map((order) => (
                <div key={order._id} className="rounded-[8px] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-black text-ink dark:text-white">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{compactDate(order.createdAt)} | {formatMoney(order.total)} | {order.paymentMethod}</p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(event) => changeStatus(order, event.target.value)}
                      className="h-11 rounded-full border border-black/10 bg-white px-3 text-sm font-black dark:border-white/10 dark:bg-stone-950 dark:text-white"
                    >
                      {["placed", "confirmed", "preparing", "out-for-delivery", "delivered", "cancelled"].map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {!orders.length ? <p className="text-sm text-stone-600 dark:text-stone-300">Orders will appear after checkout.</p> : null}
            </div>
          </div>

          <div className="glass rounded-[8px] p-5 shadow-sm">
            <h2 className="text-xl font-black text-ink dark:text-white">Food catalog</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {foods.map((food) => (
                <div key={food._id} className="rounded-[8px] border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/10">
                  <p className="font-black text-ink dark:text-white">{food.name}</p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{food.category} | {formatMoney(food.price)}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setEditing(food)} className="tap-target inline-flex items-center gap-2 rounded-full bg-gold-300 px-4 text-sm font-black text-ink">
                      <Edit3 size={15} />
                      Edit
                    </button>
                    <button onClick={() => removeFood(food)} className="tap-target inline-flex items-center gap-2 rounded-full bg-royal-600 px-4 text-sm font-black text-white">
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

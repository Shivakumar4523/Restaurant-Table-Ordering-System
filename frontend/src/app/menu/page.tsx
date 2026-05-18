"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { FoodCard } from "@/components/food/FoodCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StickyCheckoutBar } from "@/components/cart/StickyCheckoutBar";
import { useLanguage } from "@/context/LanguageContext";
import { getFoods } from "@/services/api";
import { categories } from "@/utils/sample-data";
import type { Food } from "@/utils/types";

export default function MenuPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    setLoading(true);
    const timeout = window.setTimeout(() => {
      getFoods({ category, q: query }).then((data) => {
        setFoods(data);
        setLoading(false);
      });
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [category, query]);

  const sortedFoods = useMemo(() => {
    const copy = [...foods];
    if (sort === "price-low") copy.sort((a, b) => a.price - b.price);
    if (sort === "price-high") copy.sort((a, b) => b.price - a.price);
    if (sort === "rating") copy.sort((a, b) => b.rating - a.rating);
    if (sort === "fast") copy.sort((a, b) => (a.prepTime || 20) - (b.prepTime || 20));
    return copy;
  }, [foods, sort]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Restaurant menu"
        title="Order from a fast, touch-friendly menu."
        body="Search, filter by category, sort by speed or rating, and add dishes without leaving the grid."
      />

      <div className="glass sticky top-20 z-30 rounded-[8px] p-3 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search")}
              className="h-12 w-full rounded-full border border-black/10 bg-white pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-royal-500 dark:border-white/10 dark:bg-white/10 dark:text-white"
            />
          </label>
          <label className="relative md:w-56">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-12 w-full appearance-none rounded-full border border-black/10 bg-white pl-10 pr-4 text-sm font-black outline-none transition focus:border-royal-500 dark:border-white/10 dark:bg-stone-900 dark:text-white"
            >
              <option value="featured">Featured first</option>
              <option value="rating">Highest rated</option>
              <option value="fast">Fastest prep</option>
              <option value="price-low">Price low to high</option>
              <option value="price-high">Price high to low</option>
            </select>
          </label>
        </div>
        <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`tap-target shrink-0 rounded-full px-4 text-sm font-black transition ${
                category === item
                  ? "bg-royal-600 text-white shadow-glow"
                  : "bg-white text-stone-700 hover:bg-gold-100 dark:bg-white/10 dark:text-stone-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[8px] bg-stone-200/70 dark:bg-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedFoods.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      )}

      {!loading && sortedFoods.length === 0 ? (
        <div className="glass rounded-[8px] p-8 text-center">
          <p className="font-black text-ink dark:text-white">No dishes found</p>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Try another category or search term.</p>
        </div>
      ) : null}

      <StickyCheckoutBar />
    </main>
  );
}

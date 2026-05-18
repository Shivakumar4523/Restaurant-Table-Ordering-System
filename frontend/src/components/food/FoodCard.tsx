"use client";

import Image from "next/image";
import { Clock3, Plus, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/utils/format";
import type { Food } from "@/utils/types";

export function FoodCard({ food, compact = false }: { food: Food; compact?: boolean }) {
  const { addItem } = useCart();

  return (
    <article className="card-hover glass group overflow-hidden rounded-[8px] shadow-gold">
      <div className={`relative ${compact ? "h-40" : "h-48"} overflow-hidden`}>
        <Image
          src={food.image}
          alt={food.name}
          fill
          sizes="(max-width: 768px) 90vw, 320px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/86 px-3 py-1 text-xs font-black text-royal-700 backdrop-blur dark:bg-ink/78 dark:text-gold-300">
          {food.category}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-ink/78 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
          <Star size={13} className="fill-gold-300 text-gold-300" />
          {food.rating}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-ink dark:text-white">{food.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-stone-600 dark:text-stone-300">
              {food.description}
            </p>
          </div>
          <p className="shrink-0 text-base font-black text-royal-600 dark:text-gold-300">{formatMoney(food.price)}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-1 text-xs font-bold text-gold-700 dark:bg-gold-300/15 dark:text-gold-300">
            <Clock3 size={13} />
            {food.prepTime || 20} min
          </span>
          <button
            className="tap-target inline-flex items-center justify-center gap-2 rounded-full bg-royal-600 px-4 text-sm font-black text-white shadow-glow transition hover:bg-royal-700 active:scale-[0.98]"
            onClick={() => addItem(food)}
            aria-label={`Add ${food.name} to cart`}
          >
            <Plus size={17} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

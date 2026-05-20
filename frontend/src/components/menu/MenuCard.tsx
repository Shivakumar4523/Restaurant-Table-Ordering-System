import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VegBadge } from "@/components/menu/VegBadge";
import { formatMoney } from "@/lib/constants";
import type { MenuItem } from "@/lib/api";

export function MenuCard({
  item,
  onAdd,
  onQuantityChange,
  quantity = 0
}: {
  item: MenuItem;
  onAdd?: (item: MenuItem) => void;
  onQuantityChange?: (item: MenuItem, quantity: number) => void;
  quantity?: number;
}) {
  return (
    <article className="glass flex h-full flex-col rounded-[8px] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <VegBadge type={item.foodType} />
            <p className="text-xs font-black uppercase text-gold-700">{item.categoryName}</p>
          </div>
          <h3 className="mt-2 text-lg font-black text-ink">{item.name}</h3>
        </div>
        <p className="shrink-0 text-base font-black text-forest-700">{formatMoney(item.price)}</p>
      </div>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{item.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-xs font-bold text-stone-500">{item.prepTime || 15} min</span>
        {onAdd && quantity > 0 && onQuantityChange ? (
          <div
            className="inline-grid h-11 min-w-[156px] grid-cols-[44px_56px_44px] items-center overflow-hidden rounded-full border border-gold-300/20 bg-forest-900 text-white shadow-glow"
            role="group"
            aria-label={`${item.name} quantity`}
          >
            <button
              type="button"
              className="grid h-full place-items-center text-forest-500 transition hover:bg-white/10 hover:text-gold-300"
              onClick={() => onQuantityChange(item, Math.max(0, quantity - 1))}
              aria-label={`Decrease ${item.name}`}
            >
              <Minus size={16} />
            </button>
            <span className="grid h-full place-items-center bg-white/16 px-3 text-lg font-black text-white">
              {quantity}
            </span>
            <button
              type="button"
              className="grid h-full place-items-center text-forest-500 transition hover:bg-white/10 hover:text-gold-300"
              onClick={() => onQuantityChange(item, quantity + 1)}
              aria-label={`Increase ${item.name}`}
            >
              <Plus size={16} />
            </button>
          </div>
        ) : onAdd ? (
          <Button className="h-10 min-h-10 min-w-[96px] px-4" onClick={() => onAdd(item)} aria-label={`Add ${item.name}`}>
            <Plus size={16} />
            Add
          </Button>
        ) : null}
      </div>
    </article>
  );
}

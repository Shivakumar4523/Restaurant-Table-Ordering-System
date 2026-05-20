import clsx from "clsx";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VegBadge } from "@/components/menu/VegBadge";
import { formatMoney } from "@/lib/constants";
import type { MenuItem } from "@/lib/api";

export function MenuCard({
  item,
  onAdd,
  onQuantityChange,
  quantity = 0,
  layout = "card"
}: {
  item: MenuItem;
  onAdd?: (item: MenuItem) => void;
  onQuantityChange?: (item: MenuItem, quantity: number) => void;
  quantity?: number;
  layout?: "card" | "list";
}) {
  const isList = layout === "list";
  const accentClass = item.foodType === "veg" ? "from-emerald-500 via-forest-500 to-gold-300" : "from-red-600 via-gold-300 to-forest-500";

  return (
    <article className={clsx("glass flex h-full min-w-0 flex-col rounded-[8px] shadow-sm", isList ? "p-5 sm:p-6" : "p-3.5 sm:p-4")}>
      <div className={clsx("mb-4 h-1.5 rounded-full bg-gradient-to-r sm:mb-5", accentClass)} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="shrink-0">
              <VegBadge type={item.foodType} />
            </span>
            <p className="min-w-0 truncate rounded-full border border-gold-300/20 px-2 py-1 text-xs font-black uppercase text-gold-700">
              {item.categoryName}
            </p>
          </div>
          <h3 className={clsx("break-words font-black leading-tight text-ink", isList ? "mt-4 text-xl sm:text-2xl" : "mt-3 text-lg sm:mt-4 sm:text-xl")}>
            {item.name}
          </h3>
        </div>
        <p className={clsx("shrink-0 font-black text-forest-700", isList ? "text-xl" : "text-base sm:text-lg")}>{formatMoney(item.price)}</p>
      </div>
      <p className={clsx("text-stone-600", isList ? "mt-5 text-base leading-7" : "mt-3 line-clamp-3 text-sm leading-6 sm:mt-4")}>
        {item.description}
      </p>
      <div className={clsx("mt-auto flex flex-wrap items-center justify-between gap-3", isList ? "pt-8" : "pt-5 sm:pt-6")}>
        <span className={clsx("shrink-0 whitespace-nowrap font-bold text-stone-500", isList ? "text-sm" : "text-xs")}>{item.prepTime || 15} min</span>
        {onAdd && quantity > 0 && onQuantityChange ? (
          <div
            className={clsx(
              "inline-grid max-w-full shrink-0 items-center overflow-hidden rounded-full border border-gold-300/20 bg-forest-900 text-white shadow-glow",
              isList ? "h-12 w-[188px] grid-cols-[52px_84px_52px]" : "h-10 w-[126px] grid-cols-[36px_54px_36px]"
            )}
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
            <span className={clsx("grid h-full place-items-center bg-white/16 font-black text-white", isList ? "text-xl" : "text-base")}>
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
          <Button className={clsx("min-w-[96px] px-4", isList ? "h-12 min-h-12" : "h-10 min-h-10")} onClick={() => onAdd(item)} aria-label={`Add ${item.name}`}>
            <Plus size={16} />
            Add
          </Button>
        ) : null}
      </div>
    </article>
  );
}

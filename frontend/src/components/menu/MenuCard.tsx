import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VegBadge } from "@/components/menu/VegBadge";
import { formatMoney } from "@/lib/constants";
import type { MenuItem } from "@/lib/api";

export function MenuCard({
  item,
  onAdd,
  quantity = 0
}: {
  item: MenuItem;
  onAdd?: (item: MenuItem) => void;
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
        {onAdd ? (
          <Button className="h-10 min-h-10 min-w-[96px] px-4" onClick={() => onAdd(item)} aria-label={`Add ${item.name}. Current quantity ${quantity}`}>
            <Plus size={16} />
            Add
            {quantity > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold-300 px-1.5 text-xs font-black text-forest-900">
                {quantity}
              </span>
            ) : null}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

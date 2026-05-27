import clsx from "clsx";
import { formatMoney } from "@/lib/constants";
import type { BarItem, BarPegSize } from "@/lib/api";
import { getPegPrice, pegOptions } from "@/lib/bar";

export function PegSizeSelector({
  item,
  value,
  onChange,
  compact = false
}: {
  item: BarItem;
  value: BarPegSize;
  onChange: (value: BarPegSize) => void;
  compact?: boolean;
}) {
  return (
    <div className={clsx("grid gap-2", compact ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3")} role="radiogroup" aria-label={`${item.name} peg size`}>
      {pegOptions.map((option) => {
        const price = getPegPrice(item, option.value);
        const disabled = price <= 0;
        const active = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            className={clsx(
              "min-h-12 rounded-[8px] border px-3 py-2 text-left transition",
              active ? "border-gold-300 bg-gold-300 text-forest-900 shadow-gold" : "border-gold-300/20 bg-white/5 text-white hover:border-gold-300/60",
              disabled && "cursor-not-allowed opacity-40"
            )}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            aria-checked={active}
            role="radio"
          >
            <span className="block text-xs font-black uppercase">{option.label}</span>
            <span className="mt-1 block text-sm font-black">{price > 0 ? formatMoney(price) : "N/A"}</span>
          </button>
        );
      })}
    </div>
  );
}


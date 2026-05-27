import clsx from "clsx";

export function StockStatusBadge({ stock, isAvailable }: { stock: number; isAvailable: boolean }) {
  const out = !isAvailable || stock <= 0;
  const low = isAvailable && stock > 0 && stock <= 5;

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-black uppercase",
        out && "border-red-400/40 bg-red-500/15 text-red-200",
        low && "border-gold-300/50 bg-gold-300/15 text-gold-300",
        !out && !low && "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
      )}
    >
      {out ? "Out of stock" : low ? `Low stock (${stock})` : `In stock (${stock})`}
    </span>
  );
}


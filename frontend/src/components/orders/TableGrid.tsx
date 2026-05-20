import clsx from "clsx";
import { TableStatusPill } from "@/components/ui/TableStatusPill";
import type { RestaurantTable } from "@/lib/api";

const statusRing: Record<string, string> = {
  empty: "border-emerald-400 bg-emerald-950/45",
  ordered: "border-yellow-400 bg-yellow-950/45",
  busy: "border-red-400 bg-red-950/45",
  billing: "border-blue-400 bg-blue-950/45"
};

export function TableGrid({
  tables,
  selectedId,
  onSelect
}: {
  tables: RestaurantTable[];
  selectedId?: string;
  onSelect: (table: RestaurantTable) => void;
}) {
  return (
    <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr))] sm:gap-3">
      {tables.map((table) => (
        <button
          type="button"
          key={table._id}
          onClick={() => onSelect(table)}
          className={clsx(
            "rounded-[8px] border-2 p-3 text-left transition hover:-translate-y-0.5 sm:p-4",
            statusRing[table.status],
            selectedId === table._id && "ring-4 ring-gold-300"
          )}
        >
          <p className="text-xl font-black text-ink sm:text-2xl">{table.number}</p>
          <p className="mt-1 text-xs font-bold text-stone-600">{table.section} | {table.capacity} seats</p>
          <div className="mt-3">
            <TableStatusPill status={table.status} />
          </div>
        </button>
      ))}
    </div>
  );
}

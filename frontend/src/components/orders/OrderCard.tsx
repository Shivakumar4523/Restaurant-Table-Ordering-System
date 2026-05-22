import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/constants";
import type { Order } from "@/lib/api";

const nextStatuses: Record<string, string[]> = {
  pending: ["preparing", "ready"],
  preparing: ["ready"],
  ready: ["served"],
  served: ["billing"]
};

export function OrderCard({
  order,
  onStatus,
  onBill,
  busy = false
}: {
  order: Order;
  onStatus?: (order: Order, status: string) => void;
  onBill?: (order: Order) => void;
  busy?: boolean;
}) {
  return (
    <article className="min-w-0 rounded-[8px] border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-gold-700">Table {order.table?.number || order.tableNumber}</p>
          <h3 className="mt-1 text-lg font-black text-ink">Order #{order._id.slice(-6).toUpperCase()}</h3>
          <p className="mt-1 break-words text-sm text-stone-600">{order.waiter?.name || "Staff"} | {order.status}</p>
        </div>
        <p className="shrink-0 text-xl font-black text-forest-700">{formatMoney(order.total)}</p>
      </div>
      <div className="mt-4 space-y-2">
        {order.items.map((item, index) => (
          <div className="flex justify-between gap-3 rounded-[8px] bg-cream px-3 py-2 text-sm" key={`${item.name}-${index}`}>
            <span className="min-w-0 break-words font-bold text-ink">{item.quantity} x {item.name}</span>
            <span className="shrink-0 font-black">{formatMoney(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>
      {order.customerNotes ? <p className="mt-3 rounded-[8px] bg-gold-100 p-3 text-sm font-bold text-ink">Note: {order.customerNotes}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {(nextStatuses[order.status] || []).map((status) => (
          <Button key={status} className="h-10 min-h-10 px-4 capitalize" onClick={() => onStatus?.(order, status)} disabled={busy}>
            {status}
          </Button>
        ))}
        {onBill ? (
          <Button variant="secondary" className="h-10 min-h-10 px-4" onClick={() => onBill(order)} disabled={busy}>
            Generate bill
          </Button>
        ) : null}
      </div>
    </article>
  );
}

import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/constants";
import type { Order } from "@/lib/api";

export function BillPreview({
  order,
  onClose,
  onPaid
}: {
  order: Order | null;
  onClose: () => void;
  onPaid?: (method: "cash" | "card" | "upi") => void;
}) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="print-area max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[8px] bg-white p-6 shadow-2xl">
        <div className="text-center">
          <p className="text-xs font-black uppercase text-gold-700">Royal Spice Restaurant</p>
          <h2 className="mt-1 text-2xl font-black text-ink">Table Bill</h2>
          <p className="mt-1 text-sm text-stone-600">Bill #{order.billNumber || order._id.slice(-6).toUpperCase()} | Table {order.table?.number || order.tableNumber}</p>
        </div>
        <div className="mt-6 space-y-2">
          {order.items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="grid grid-cols-[1fr_44px_80px] gap-2 text-sm">
              <span className="font-bold">{item.name}</span>
              <span className="text-center">{item.quantity}</span>
              <span className="text-right font-black">{formatMoney(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2 border-t border-dashed border-stone-300 pt-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(order.subtotal)}</strong></div>
          <div className="flex justify-between"><span>GST {order.gstRate || 5}%</span><strong>{formatMoney(order.gst)}</strong></div>
          <div className="flex justify-between text-lg"><span className="font-black">Total</span><strong>{formatMoney(order.total)}</strong></div>
        </div>
        <div className="no-print mt-6 flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="secondary" onClick={() => window.print()}>Print bill</Button>
          {onPaid ? (
            <>
              <Button onClick={() => onPaid("cash")}>Paid cash</Button>
              <Button onClick={() => onPaid("upi")}>Paid UPI</Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

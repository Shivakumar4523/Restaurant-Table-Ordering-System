import { Banknote, CreditCard, Printer, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import type { Order } from "@/lib/api";

const restaurantDetails = {
  name: "ROYAL SPICE RESTAURANT",
  address: ["Garden Road, Hyderabad"],
  gstin: ""
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
    .format(date)
    .toUpperCase();
}

function formatAmount(value: number) {
  return Number(value || 0).toFixed(2);
}

function formatQuantity(value: number) {
  return Number(value || 0).toFixed(1);
}

function buildReceiptNumber(order: Order, printedAt: Date) {
  const day = String(printedAt.getDate()).padStart(2, "0");
  const month = String(printedAt.getMonth() + 1).padStart(2, "0");
  const year = String(printedAt.getFullYear()).slice(-2);
  const seed = order._id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const sequence = String(seed % 10000).padStart(4, "0");

  return `T2${day}${month}${year}-${sequence}`;
}

function buildTokenNumber(order: Order) {
  const seed = order._id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `T${String((seed % 900) + 100)}`;
}

export function BillPreview({
  order,
  onClose,
  onPaid
}: {
  order: Order | null;
  onClose: () => void;
  onPaid?: (method: "cash" | "card" | "upi") => void;
}) {
  const { user } = useAuth();

  if (!order) return null;

  const printedAt = new Date();
  const tableNumber = order.table?.number || order.tableNumber || "-";
  const billNumber = buildReceiptNumber(order, printedAt);
  const tokenNumber = buildTokenNumber(order);
  const cashierName = user?.employeeCode ? `${user.name}@${user.employeeCode}` : user?.name || "cashier";
  const itemCount = order.items.length;
  const itemQuantity = order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const discount = Number(order.discount || 0);
  const taxableAmount = Math.max(0, Number(order.subtotal || 0) - discount);
  const cgst = Number(order.gst || 0) / 2;
  const sgst = Number(order.gst || 0) - cgst;
  const beforeRoundedTotal = taxableAmount + Number(order.gst || 0);
  const roundedOff = Number(order.total || 0) - beforeRoundedTotal;
  const roundedOffLabel = roundedOff < 0 ? "Rounded Off (-)" : "Rounded Off (+)";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="thermal-receipt print-area max-h-[92vh] w-full max-w-[380px] overflow-y-auto rounded-[8px] bg-white px-5 py-6 shadow-2xl">
        <div className="receipt-body">
          <header className="text-center">
            <h2 className="text-[20px] font-black uppercase leading-tight tracking-[0.12em]">{restaurantDetails.name}</h2>
            <div className="mt-1 text-[13px] leading-[1.25]">
              {restaurantDetails.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
              {restaurantDetails.gstin ? <p>GSTIN {restaurantDetails.gstin}</p> : null}
            </div>
            <p className="mt-5 text-[20px] font-black uppercase tracking-[0.08em]">DINEIN</p>
          </header>

          <section className="mt-5 grid grid-cols-2 gap-x-5 gap-y-1 text-[15px] leading-tight">
            <div className="min-w-0">
              <span>Token NO</span>
              <span className="ml-3 font-semibold">{tokenNumber}</span>
            </div>
            <div className="text-right">
              <span>Date</span>
              <span className="ml-3 font-semibold">{formatDate(printedAt)}</span>
            </div>
            <div className="min-w-0 truncate">
              <span>Cashier</span>
              <span className="ml-2 font-semibold">{cashierName}</span>
            </div>
            <div className="text-right">
              <span>Time</span>
              <span className="ml-3 font-semibold">{formatTime(printedAt)}</span>
            </div>
            <div className="col-span-2 mt-2 text-[21px]">
              <span>Table No</span>
              <span className="ml-3 font-semibold">{tableNumber}</span>
            </div>
          </section>

          <p className="mt-5 text-[18px] font-black">Bill No : {billNumber}</p>

          <section className="mt-4 border-y border-dashed border-[#9ca3af] py-2">
            <div className="receipt-grid receipt-head text-[16px] uppercase">
              <span>ITEM</span>
              <span className="text-center">QTY</span>
              <span className="text-right">RATE</span>
              <span className="text-right">TOTAL</span>
            </div>
          </section>

          <section className="border-b border-dashed border-[#9ca3af] py-2">
            {order.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="receipt-grid py-1 text-[15px] leading-[1.18]">
                <span className="min-w-0 break-words pr-1">{item.name}</span>
                <span className="text-center tabular-nums">{formatQuantity(item.quantity)}</span>
                <span className="text-right tabular-nums">{formatAmount(item.price)}</span>
                <span className="text-right tabular-nums">{formatAmount(item.price * item.quantity)}</span>
              </div>
            ))}
          </section>

          <section className="border-b border-dashed border-[#9ca3af] py-3 text-[15px]">
            <div className="receipt-total-row">
              <span>Subtotal</span>
              <span>{formatAmount(order.subtotal)}</span>
            </div>
            {discount > 0 ? (
              <div className="receipt-total-row">
                <span>Discount (-)</span>
                <span>{formatAmount(discount)}</span>
              </div>
            ) : null}
          </section>

          <section className="border-b border-dashed border-[#9ca3af] py-3 text-[15px]">
            <div className="receipt-total-row">
              <span>CGST({formatAmount((order.gstRate || 5) / 2)}%)</span>
              <span>{formatAmount(cgst)}</span>
            </div>
            <div className="receipt-total-row">
              <span>SGST({formatAmount((order.gstRate || 5) / 2)}%)</span>
              <span>{formatAmount(sgst)}</span>
            </div>
            <div className="receipt-total-row">
              <span>{roundedOffLabel}</span>
              <span>{formatAmount(Math.abs(roundedOff))}</span>
            </div>
          </section>

          <section className="border-b border-dashed border-[#9ca3af] py-3">
            <div className="receipt-total-row text-[22px] font-black">
              <span>Grand Total :</span>
              <span>{formatAmount(order.total)}</span>
            </div>
          </section>

          <section className="border-b border-dashed border-[#9ca3af] py-3 text-[15px]">
            <div className="receipt-total-row">
              <span>Item Count</span>
              <span>{formatAmount(itemCount)}</span>
            </div>
            <div className="receipt-total-row">
              <span>Item Qty</span>
              <span>{formatAmount(itemQuantity)}</span>
            </div>
            <div className="receipt-total-row">
              <span>Cash Tendered</span>
              <span>0.00</span>
            </div>
            <div className="receipt-total-row">
              <span>Change</span>
              <span>0.00</span>
            </div>
          </section>

          <footer className="pt-4 text-center text-[14px] leading-relaxed">
            <p>&quot; Reference Bill - Payment Awaited &quot;</p>
            <p className="mt-5 font-semibold">Printed On : {formatDate(printedAt)} {formatTime(printedAt)}</p>
            <p className="mt-3 font-black">*** Thank you - Visit Again ***</p>
          </footer>
        </div>

        <div className="no-print mt-6 flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={15} />
            Print bill
          </Button>
          {onPaid ? (
            <>
              <Button onClick={() => onPaid("cash")}>
                <Banknote size={15} />
                Paid cash
              </Button>
              <Button onClick={() => onPaid("card")}>
                <CreditCard size={15} />
                Paid card
              </Button>
              <Button onClick={() => onPaid("upi")}>
                <QrCode size={15} />
                Paid UPI
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

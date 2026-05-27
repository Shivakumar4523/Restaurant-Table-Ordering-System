export const roles = ["admin", "waiter", "kitchen", "bar", "cashier"] as const;

export const orderStatuses = ["pending", "preparing", "ready", "served"] as const;

export const tableStatusStyles: Record<string, string> = {
  empty: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ordered: "bg-yellow-100 text-yellow-800 border-yellow-200",
  busy: "bg-red-100 text-red-800 border-red-200",
  billing: "bg-blue-100 text-blue-800 border-blue-200"
};

export const tableStatusLabels: Record<string, string> = {
  empty: "Empty",
  ordered: "Ordered",
  busy: "Busy",
  billing: "Billing"
};

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

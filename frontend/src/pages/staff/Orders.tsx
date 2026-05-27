import { useEffect, useMemo, useState } from "react";
import { Banknote, CreditCard, Minus, Plus, QrCode, ReceiptText, RefreshCw, Search, Send, Wine } from "lucide-react";
import { BillPreview } from "@/components/orders/BillPreview";
import { TableGrid } from "@/components/orders/TableGrid";
import { MenuCard } from "@/components/menu/MenuCard";
import { QuantityStepper } from "@/components/menu/QuantityStepper";
import { PegSizeSelector } from "@/components/bar/PegSizeSelector";
import { StockStatusBadge } from "@/components/bar/StockStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { getDefaultPegSize, getPegLabel, getPegPrice, isOutOfStock } from "@/lib/bar";
import {
  getActiveOrders,
  getBarItems,
  getBill,
  getCategories,
  getMenuItems,
  getTables,
  markBilling,
  recordPayment,
  resolveAssetUrl,
  submitTableOrder,
  type Bill,
  type BarItem,
  type BarPegSize,
  type Category,
  type MenuItem,
  type Order,
  type RestaurantTable
} from "@/lib/api";
import { formatMoney } from "@/lib/constants";

type CartLine = {
  kind: "food";
  item: MenuItem;
  quantity: number;
  note?: string;
} | {
  kind: "bar";
  item: BarItem;
  pegSize: BarPegSize;
  price: number;
  quantity: number;
  note?: string;
};

type CashierFilter = "all" | "ready" | "served" | "billing";
type PaymentMethod = "cash" | "card" | "upi";

const activeCashierStatuses: Order["status"][] = ["pending", "preparing", "ready", "served", "billing"];

const cashierFilters: Array<{ value: CashierFilter; label: string }> = [
  { value: "all", label: "All unpaid" },
  { value: "ready", label: "Ready" },
  { value: "served", label: "Served" },
  { value: "billing", label: "Billing" }
];

const paymentMethods: Array<{ method: PaymentMethod; label: string; Icon: typeof Banknote }> = [
  { method: "cash", label: "Cash", Icon: Banknote },
  { method: "card", label: "Card", Icon: CreditCard },
  { method: "upi", label: "UPI", Icon: QrCode }
];

const orderStatusStyles: Record<Order["status"], string> = {
  pending: "border-yellow-200 bg-yellow-100 text-yellow-800",
  preparing: "border-orange-200 bg-orange-100 text-orange-800",
  ready: "border-emerald-200 bg-emerald-100 text-emerald-800",
  served: "border-forest-700 bg-forest-50 text-forest-700",
  billing: "border-blue-200 bg-blue-100 text-blue-800",
  merged: "border-stone-200 bg-stone-100 text-stone-700",
  cancelled: "border-red-200 bg-red-100 text-red-800"
};

function mergeActiveOrder(current: Order[], order: Order) {
  if (order.paymentStatus === "paid" || !activeCashierStatuses.includes(order.status)) {
    return current.filter((item) => item._id !== order._id);
  }

  if (current.some((item) => item._id === order._id)) {
    return current.map((item) => (item._id === order._id ? order : item));
  }

  return [order, ...current];
}

function mergeMenuItem(current: MenuItem[], item: MenuItem) {
  if (item.isAvailable === false) return current.filter((record) => record._id !== item._id);

  const nextItems = current.some((record) => record._id === item._id)
    ? current.map((record) => (record._id === item._id ? item : record))
    : [item, ...current];

  return nextItems.sort((a, b) => {
    if (Boolean(a.isFeatured) !== Boolean(b.isFeatured)) return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
    return a.categoryName.localeCompare(b.categoryName) || a.name.localeCompare(b.name);
  });
}

function mergeBarItem(current: BarItem[], item: BarItem) {
  const nextItems = current.some((record) => record._id === item._id)
    ? current.map((record) => (record._id === item._id ? item : record))
    : [item, ...current];

  return nextItems.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

function removeById<T extends { _id: string }>(records: T[], id: string) {
  return records.filter((record) => record._id !== id);
}

function barLineKey(item: BarItem, pegSize: BarPegSize) {
  return `${item._id}:${pegSize}`;
}

function buildBillOrder(bill: Bill): Order {
  return {
    ...bill.order,
    subtotal: bill.subtotal,
    discount: bill.discount,
    gst: bill.gst,
    gstRate: bill.gstRate,
    total: bill.total,
    billNumber: bill.billNumber
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function Orders() {
  const { user } = useAuth();

  if (user?.role === "cashier") {
    return <CashierOrders />;
  }

  return <WaiterOrders />;
}

function WaiterOrders() {
  const { socket } = useSocket();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [barItems, setBarItems] = useState<BarItem[]>([]);
  const [barCategories, setBarCategories] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [menuMode, setMenuMode] = useState<"food" | "bar">("food");
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerNotes, setCustomerNotes] = useState("");
  const [message, setMessage] = useState("");
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      setCatalogLoading(true);

      try {
        const [tableData, categoryData, menuData, barData] = await Promise.all([
          getTables(),
          getCategories(),
          getMenuItems(),
          getBarItems({ limit: 240 })
        ]);

        if (!active) return;

        setTables(tableData);
        setCategories(categoryData);
        setItems(menuData);
        setBarItems(barData.barItems);
        setBarCategories(barData.categories);
        setSelectedTable(tableData[0] || null);
      } catch (error) {
        if (active) setMessage(getErrorMessage(error, "Unable to load ordering items."));
      } finally {
        if (active) setCatalogLoading(false);
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleTableUpdate = (table: RestaurantTable) => {
      setTables((current) => current.map((item) => (item._id === table._id ? { ...item, ...table } : item)));
    };

    socket.emit("join:staff");
    socket.on("table:updated", handleTableUpdate);

    return () => {
      socket.off("table:updated", handleTableUpdate);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const syncMenuItem = (item: MenuItem) => {
      setItems((current) => mergeMenuItem(current, item));
      setCart((current) => {
        if (item.isAvailable === false) return current.filter((line) => line.kind !== "food" || line.item._id !== item._id);
        return current.map((line) => (line.kind === "food" && line.item._id === item._id ? { ...line, item } : line));
      });
    };

    const syncBarItem = (item: BarItem) => {
      setBarItems((current) => mergeBarItem(current, item));
      setCart((current) =>
        current
          .map((line) => {
            if (line.kind !== "bar" || line.item._id !== item._id) return line;
            return { ...line, item, price: getPegPrice(item, line.pegSize) };
          })
          .filter((line) => line.kind === "food" || (!isOutOfStock(line.item) && line.price > 0))
      );
    };

    const removeBarItem = (payload: { _id: string }) => {
      setBarItems((current) => removeById(current, payload._id));
      setCart((current) => current.filter((line) => line.kind === "food" || line.item._id !== payload._id));
    };

    socket.on("menu-item:updated", syncMenuItem);
    socket.on("bar-item:updated", syncBarItem);
    socket.on("bar-item:deleted", removeBarItem);

    return () => {
      socket.off("menu-item:updated", syncMenuItem);
      socket.off("bar-item:updated", syncBarItem);
      socket.off("bar-item:deleted", removeBarItem);
    };
  }, [socket]);

  const visibleItems = useMemo(() => {
    const normalized = query.toLowerCase();
    return items.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.categoryName === activeCategory;
      const matchesSearch = !normalized || [item.name, item.description, item.categoryName, ...(item.tags || [])].join(" ").toLowerCase().includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, items, query]);

  const visibleBarItems = useMemo(() => {
    const normalized = query.toLowerCase();
    return barItems.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = !normalized || [item.name, item.description, item.category, item.brand, item.alcoholType].join(" ").toLowerCase().includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, barItems, query]);

  const subtotal = cart.reduce((sum, line) => sum + (line.kind === "bar" ? line.price : line.item.price) * line.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;
  const itemQuantities = useMemo(
    () => new Map(cart.filter((line) => line.kind === "food").map((line) => [line.item._id, line.quantity])),
    [cart]
  );
  const barItemQuantities = useMemo(
    () => new Map(cart.filter((line) => line.kind === "bar").map((line) => [barLineKey(line.item, line.pegSize), line.quantity])),
    [cart]
  );

  function addItem(item: MenuItem) {
    setCart((current) => {
      const existing = current.find((line) => line.kind === "food" && line.item._id === item._id);
      if (existing) return current.map((line) => (line.kind === "food" && line.item._id === item._id ? { ...line, quantity: line.quantity + 1 } : line));
      return [...current, { kind: "food", item, quantity: 1 }];
    });
  }

  function addBarItem(item: BarItem, pegSize: BarPegSize) {
    const price = getPegPrice(item, pegSize);
    if (isOutOfStock(item) || price <= 0) return;

    const key = barLineKey(item, pegSize);
    setCart((current) => {
      const existing = current.find((line) => line.kind === "bar" && barLineKey(line.item, line.pegSize) === key);
      if (existing) return current.map((line) => (line.kind === "bar" && barLineKey(line.item, line.pegSize) === key ? { ...line, quantity: line.quantity + 1 } : line));
      return [...current, { kind: "bar", item, pegSize, price, quantity: 1 }];
    });
  }

  function setFoodQuantity(id: string, quantity: number) {
    setCart((current) => current.map((line) => (line.kind === "food" && line.item._id === id ? { ...line, quantity } : line)).filter((line) => line.quantity > 0));
  }

  function setBarQuantity(key: string, quantity: number) {
    setCart((current) =>
      current
        .map((line) => (line.kind === "bar" && barLineKey(line.item, line.pegSize) === key ? { ...line, quantity } : line))
        .filter((line) => line.quantity > 0)
    );
  }

  function switchMenuMode(nextMode: "food" | "bar") {
    setMenuMode(nextMode);
    setActiveCategory("All");
  }

  async function submitOrder() {
    if (submitting) return;

    if (!selectedTable || !cart.length) {
      setMessage("Select a table and add at least one item.");
      return;
    }

    const previousTables = tables;
    const previousSelectedTable = selectedTable;
    const optimisticTable = { ...selectedTable, status: "ordered" as RestaurantTable["status"] };

    setSubmitting(true);
    setTables((current) => current.map((table) => (table._id === optimisticTable._id ? optimisticTable : table)));
    setSelectedTable(optimisticTable);

    try {
      const order = await submitTableOrder({
        tableId: selectedTable._id,
        customerNotes,
        items: cart.map((line) =>
          line.kind === "bar"
            ? { barItem: line.item._id, pegSize: line.pegSize, quantity: line.quantity, note: line.note }
            : { menuItem: line.item._id, quantity: line.quantity, note: line.note }
        )
      });
      const updatedTable = order.table || optimisticTable;

      setTables((current) => current.map((table) => (table._id === updatedTable._id ? updatedTable : table)));
      setSelectedTable((current) => (current?._id === updatedTable._id ? updatedTable : current));
      setCart([]);
      setCustomerNotes("");
      setMessage(`Order sent for table ${updatedTable.number}.`);
    } catch (error) {
      setTables(previousTables);
      setSelectedTable(previousSelectedTable);
      setMessage(getErrorMessage(error, "Unable to submit order."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="w-full max-w-none px-0 py-4 sm:py-6">
      <div className="grid w-full gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 space-y-5 sm:space-y-6">
          <div>
            <p className="text-xs font-black uppercase text-gold-700">Waiter ordering</p>
            <h2 className="mt-1 text-2xl font-black leading-tight text-ink sm:text-3xl">Select table and add food items</h2>
          </div>
          <TableGrid tables={tables} selectedId={selectedTable?._id} onSelect={setSelectedTable} />
        </section>
        <aside className="h-fit rounded-[8px] bg-forest-900 p-4 text-white shadow-glow sm:p-5 lg:sticky lg:top-20">
          <p className="text-xs font-black uppercase text-gold-300">Current cart</p>
          <h2 className="mt-1 text-2xl font-black">Table {selectedTable?.number || "-"}</h2>
          <div className="mt-5 space-y-3">
            {cart.map((line) => (
              <div key={line.kind === "bar" ? barLineKey(line.item, line.pegSize) : line.item._id} className="rounded-[8px] bg-white/10 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-black">
                      {line.item.name}
                      {line.kind === "bar" ? <span className="ml-1 text-gold-300">({getPegLabel(line.pegSize)})</span> : null}
                    </p>
                    <p className="text-sm text-white/70">{formatMoney(line.kind === "bar" ? line.price : line.item.price)}</p>
                  </div>
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(value) =>
                      line.kind === "bar"
                        ? setBarQuantity(barLineKey(line.item, line.pegSize), value)
                        : setFoodQuantity(line.item._id, value)
                    }
                  />
                </div>
              </div>
            ))}
            {!cart.length ? <p className="rounded-[8px] bg-white/10 p-4 text-sm font-bold text-white/74">No items selected.</p> : null}
          </div>
          <textarea className="mt-4 min-h-24 w-full rounded-[8px] border border-white/10 bg-white/10 p-3 text-sm font-semibold text-white outline-none placeholder:text-white/45" placeholder="Customer notes" value={customerNotes} onChange={(event) => setCustomerNotes(event.target.value)} />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
            <div className="flex justify-between"><span>GST 5%</span><strong>{formatMoney(gst)}</strong></div>
            <div className="flex justify-between text-lg"><span className="font-black">Total</span><strong>{formatMoney(total)}</strong></div>
          </div>
          {message ? <p className="mt-4 rounded-[8px] bg-gold-300 p-3 text-sm font-black text-forest-900">{message}</p> : null}
          <Button className="mt-5 w-full bg-gold-300 text-forest-900 hover:bg-gold-500" onClick={submitOrder} disabled={submitting}>
            <Send size={16} />
            {submitting ? "Submitting..." : "Submit order"}
          </Button>
        </aside>
      </div>

      <section className="mt-5 w-full min-w-0 max-w-none space-y-5 sm:mt-6">
        <div className="w-full min-w-0 space-y-3">
          <div className="grid w-full min-w-0 gap-3 xl:grid-cols-[minmax(14rem,20rem)_minmax(18rem,1fr)] xl:items-center">
            <div className="grid grid-cols-2 overflow-hidden rounded-full border border-gold-300/20 bg-white/5 p-1">
              <button
                type="button"
                className={`h-10 rounded-full text-sm font-black transition ${menuMode === "food" ? "bg-gold-300 text-forest-900" : "text-white hover:bg-white/10"}`}
                onClick={() => switchMenuMode("food")}
              >
                Food
              </button>
              <button
                type="button"
                className={`h-10 rounded-full text-sm font-black transition ${menuMode === "bar" ? "bg-gold-300 text-forest-900" : "text-white hover:bg-white/10"}`}
                onClick={() => switchMenuMode("bar")}
              >
                Bar
              </button>
            </div>
            <div className="relative w-full min-w-0">
              <Search className="absolute left-3 top-3 text-stone-400" size={17} />
              <Input className="pl-10" placeholder="Search items" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
          </div>
          <div className="hide-scrollbar flex w-full min-w-0 gap-2 overflow-x-auto pb-1">
            {(menuMode === "food" ? ["All", ...categories.map((category) => category.name)] : ["All", ...barCategories]).map((category) => (
              <Button key={category} variant={activeCategory === category ? "primary" : "ghost"} className="h-10 min-h-10 whitespace-nowrap px-4" onClick={() => setActiveCategory(category)}>
                {category}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {catalogLoading ? (
            <p className="col-span-full rounded-[8px] border border-gold-300/20 bg-white/5 p-6 text-center text-sm font-black text-white/70">
              Loading items...
            </p>
          ) : menuMode === "food"
            ? visibleItems.map((item) => (
                <MenuCard
                  key={item._id}
                  item={item}
                  onAdd={addItem}
                  onQuantityChange={(menuItem, quantity) => setFoodQuantity(menuItem._id, quantity)}
                  quantity={itemQuantities.get(item._id) || 0}
                />
              ))
            : visibleBarItems.map((item) => (
                <StaffBarCard
                  key={item._id}
                  item={item}
                  quantityForPeg={(nextPegSize) => barItemQuantities.get(barLineKey(item, nextPegSize)) || 0}
                  onAdd={addBarItem}
                  onQuantityChange={(nextPegSize, quantity) => setBarQuantity(barLineKey(item, nextPegSize), quantity)}
                />
              ))}
          {!catalogLoading && menuMode === "food" && !visibleItems.length ? (
            <p className="col-span-full rounded-[8px] border border-gold-300/20 bg-white/5 p-6 text-center text-sm font-black text-white/70">
              No food items found.
            </p>
          ) : null}
          {!catalogLoading && menuMode === "bar" && !visibleBarItems.length ? (
            <p className="col-span-full rounded-[8px] border border-gold-300/20 bg-white/5 p-6 text-center text-sm font-black text-white/70">
              No bar items found. Add drinks in Admin &gt; Bar Items or run the bar seed command on the server.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function StaffBarCard({
  item,
  quantityForPeg,
  onAdd,
  onQuantityChange
}: {
  item: BarItem;
  quantityForPeg: (pegSize: BarPegSize) => number;
  onAdd: (item: BarItem, pegSize: BarPegSize) => void;
  onQuantityChange: (pegSize: BarPegSize, quantity: number) => void;
}) {
  const [pegSize, setPegSize] = useState<BarPegSize>(() => getDefaultPegSize(item));
  const price = getPegPrice(item, pegSize);
  const quantity = quantityForPeg(pegSize);
  const unavailable = isOutOfStock(item) || price <= 0;

  useEffect(() => {
    setPegSize(getDefaultPegSize(item));
  }, [item]);

  return (
    <article className="glass flex h-full min-w-0 flex-col overflow-hidden rounded-[8px] shadow-sm">
      <div className="relative aspect-[4/3] bg-black/30">
        {item.image ? (
          <img src={resolveAssetUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-gold-300">
            <Wine size={34} />
          </div>
        )}
        {isOutOfStock(item) ? <div className="absolute left-3 top-3 rounded-[8px] bg-red-600 px-3 py-1 text-xs font-black uppercase text-white">Out of stock</div> : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-gold-700">{item.category}</p>
            <h3 className="mt-2 break-words text-lg font-black text-ink">{item.name}</h3>
            <p className="mt-1 text-sm font-semibold text-stone-600">{item.brand || item.alcoholType || "Bar item"}</p>
          </div>
          <StockStatusBadge stock={item.stock} isAvailable={item.isAvailable} />
        </div>
        <div className="mt-4">
          <PegSizeSelector item={item} value={pegSize} onChange={setPegSize} compact />
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="text-lg font-black text-gold-700">{price > 0 ? formatMoney(price) : "N/A"}</p>
          {quantity > 0 ? (
            <div
              className="inline-grid h-10 w-[126px] max-w-full shrink-0 grid-cols-[36px_54px_36px] items-center overflow-hidden rounded-full border border-gold-300/20 bg-forest-900 text-white shadow-glow"
              role="group"
              aria-label={`${item.name} ${getPegLabel(pegSize)} quantity`}
            >
              <button
                type="button"
                className="grid h-full place-items-center text-forest-500 transition hover:bg-white/10 hover:text-gold-300"
                onClick={() => onQuantityChange(pegSize, Math.max(0, quantity - 1))}
                aria-label={`Decrease ${item.name}`}
              >
                <Minus size={16} />
              </button>
              <span className="grid h-full place-items-center bg-white/16 text-base font-black text-white">{quantity}</span>
              <button
                type="button"
                className="grid h-full place-items-center text-forest-500 transition hover:bg-white/10 hover:text-gold-300"
                onClick={() => onQuantityChange(pegSize, quantity + 1)}
                aria-label={`Increase ${item.name}`}
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <Button className="h-10 min-h-10 px-4" disabled={unavailable} onClick={() => onAdd(item, pegSize)}>
              <Plus size={16} />
              Add
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function CashierOrders() {
  const { socket } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<CashierFilter>("all");
  const [query, setQuery] = useState("");
  const [billOrder, setBillOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setMessage("");

    try {
      const activeOrders = await getActiveOrders();
      setOrders(activeOrders.filter((order) => order.paymentStatus !== "paid"));
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to load cashier orders."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const syncOrder = (order: Order) => setOrders((current) => mergeActiveOrder(current, order));

    socket.emit("join:staff");
    socket.on("order:created", syncOrder);
    socket.on("order:updated", syncOrder);

    return () => {
      socket.off("order:created", syncOrder);
      socket.off("order:updated", syncOrder);
    };
  }, [socket]);

  const visibleOrders = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter = activeFilter === "all" || order.status === activeFilter;
      const searchableText = [
        order.table?.number,
        order.tableNumber,
        order._id,
        order.status,
        order.waiter?.name,
        ...order.items.map((item) => item.name)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesFilter && (!normalized || searchableText.includes(normalized));
    });
  }, [activeFilter, orders, query]);

  const billingCount = orders.filter((order) => order.status === "billing").length;
  const dueTotal = orders.reduce((sum, order) => sum + order.total, 0);
  const readyCount = orders.filter((order) => order.status === "ready" || order.status === "served").length;

  async function handleGenerateBill(order: Order) {
    setBusyOrderId(order._id);
    setMessage("");

    try {
      const billingOrder = order.status === "billing" ? order : await markBilling(order._id);
      setOrders((current) => mergeActiveOrder(current, billingOrder));

      const bill = await getBill(billingOrder._id);
      const previewOrder = buildBillOrder(bill);
      setBillOrder(previewOrder);
      setOrders((current) => mergeActiveOrder(current, previewOrder));
      setMessage(`Bill ready for table ${previewOrder.table?.number || previewOrder.tableNumber}.`);
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to generate bill."));
    } finally {
      setBusyOrderId(null);
    }
  }

  async function handlePayment(order: Order, method: PaymentMethod) {
    setBusyOrderId(order._id);
    setMessage("");

    try {
      const paidOrder = await recordPayment(order._id, method);
      setOrders((current) => current.filter((item) => item._id !== paidOrder._id));
      setBillOrder(null);
      setMessage(`Payment recorded for table ${paidOrder.table?.number || paidOrder.tableNumber}.`);
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to record payment."));
    } finally {
      setBusyOrderId(null);
    }
  }

  return (
    <main className="w-full max-w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-gold-700">Cashier billing</p>
          <h2 className="mt-1 break-words text-2xl font-black text-ink sm:text-3xl">Table bills and payments</h2>
        </div>
        <Button variant="ghost" className="h-10 min-h-10 px-4" onClick={loadOrders} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : undefined} size={16} />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="glass rounded-[8px] p-4">
          <p className="text-xs font-black uppercase text-gold-700">Unpaid orders</p>
          <p className="mt-2 text-2xl font-black text-ink">{orders.length}</p>
        </div>
        <div className="glass rounded-[8px] p-4">
          <p className="text-xs font-black uppercase text-gold-700">Ready or served</p>
          <p className="mt-2 text-2xl font-black text-ink">{readyCount}</p>
        </div>
        <div className="glass rounded-[8px] p-4">
          <p className="text-xs font-black uppercase text-gold-700">Amount due</p>
          <p className="mt-2 text-2xl font-black text-ink">{formatMoney(dueTotal)}</p>
        </div>
      </div>

      {message ? <p className="mt-4 rounded-[8px] bg-gold-100 p-3 text-sm font-black text-ink">{message}</p> : null}

      <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-md">
          <Search className="absolute left-3 top-3 text-stone-400" size={17} />
          <Input className="pl-10" placeholder="Search table, order, dish, waiter" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="hide-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
          {cashierFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={activeFilter === filter.value ? "primary" : "ghost"}
              className="h-10 min-h-10 whitespace-nowrap px-4"
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
              {filter.value === "billing" ? <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{billingCount}</span> : null}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-4 xl:grid-cols-2">
        {visibleOrders.map((order) => (
          <CashierOrderCard
            key={order._id}
            order={order}
            busy={busyOrderId === order._id}
            onBill={handleGenerateBill}
            onPaid={handlePayment}
          />
        ))}
      </div>

      {!visibleOrders.length ? (
        <p className="mt-8 w-full max-w-full break-words rounded-[8px] border border-dashed border-black/20 p-8 text-center font-bold text-stone-600">
          No unpaid table bills found.
        </p>
      ) : null}

      <BillPreview
        order={billOrder}
        onClose={() => setBillOrder(null)}
        onPaid={(method) => {
          if (billOrder) handlePayment(billOrder, method);
        }}
      />
    </main>
  );
}

function CashierOrderCard({
  order,
  busy,
  onBill,
  onPaid
}: {
  order: Order;
  busy: boolean;
  onBill: (order: Order) => void;
  onPaid: (order: Order, method: PaymentMethod) => void;
}) {
  const canBill = order.status === "ready" || order.status === "served" || order.status === "billing";
  const canPay = order.status === "billing";
  const tableNumber = order.table?.number || order.tableNumber;
  const orderedAt = new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <article className="min-w-0 rounded-[8px] border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-gold-700">Table {tableNumber}</p>
          <h3 className="mt-1 text-lg font-black text-ink">Order #{order._id.slice(-6).toUpperCase()}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge className={orderStatusStyles[order.status]}>{order.status}</Badge>
            <span className="text-xs font-bold text-stone-600">{orderedAt}</span>
            <span className="text-xs font-bold text-stone-600">{order.waiter?.name || "Staff"}</span>
          </div>
        </div>
        <p className="shrink-0 text-2xl font-black text-forest-700">{formatMoney(order.total)}</p>
      </div>

      <div className="mt-4 space-y-2">
        {order.items.map((item, index) => (
          <div className="grid grid-cols-[1fr_auto] gap-3 rounded-[8px] bg-cream px-3 py-2 text-sm" key={`${item.name}-${index}`}>
            <span className="min-w-0 break-words font-bold text-ink">{item.quantity} x {item.name}</span>
            <span className="shrink-0 font-black">{formatMoney(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {order.customerNotes ? <p className="mt-3 rounded-[8px] bg-gold-100 p-3 text-sm font-bold text-ink">Note: {order.customerNotes}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" className="h-10 min-h-10 px-4" onClick={() => onBill(order)} disabled={!canBill || busy}>
          <ReceiptText size={16} />
          {order.status === "billing" ? "View bill" : "Generate bill"}
        </Button>
        {canPay
          ? paymentMethods.map(({ method, label, Icon }) => (
              <Button key={method} className="h-10 min-h-10 px-4" onClick={() => onPaid(order, method)} disabled={busy}>
                <Icon size={16} />
                {label}
              </Button>
            ))
          : null}
      </div>
    </article>
  );
}

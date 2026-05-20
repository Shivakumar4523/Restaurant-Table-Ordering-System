import { useEffect, useMemo, useState } from "react";
import { Search, Send } from "lucide-react";
import { BillPreview } from "@/components/orders/BillPreview";
import { OrderCard } from "@/components/orders/OrderCard";
import { TableGrid } from "@/components/orders/TableGrid";
import { MenuCard } from "@/components/menu/MenuCard";
import { QuantityStepper } from "@/components/menu/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  getActiveOrders,
  getBill,
  getCategories,
  getMenuItems,
  getTables,
  markBilling,
  recordPayment,
  submitTableOrder,
  updateOrderStatus,
  type Category,
  type MenuItem,
  type Order,
  type RestaurantTable
} from "@/lib/api";
import { formatMoney } from "@/lib/constants";
import { useSocket } from "@/context/SocketContext";

type CartLine = {
  item: MenuItem;
  quantity: number;
  note?: string;
};

export function Orders() {
  const { socket } = useSocket();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerNotes, setCustomerNotes] = useState("");
  const [bill, setBill] = useState<Order | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([getTables(), getCategories(), getMenuItems(), getActiveOrders()]).then(([tableData, categoryData, menuData, orderData]) => {
      setTables(tableData);
      setCategories(categoryData);
      setItems(menuData);
      setOrders(orderData);
      setSelectedTable(tableData[0] || null);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join:staff");
    socket.on("order:created", (order: Order) => setOrders((current) => [order, ...current.filter((item) => item._id !== order._id)]));
    socket.on("order:updated", (order: Order) => setOrders((current) => current.map((item) => (item._id === order._id ? order : item)).filter((item) => item.paymentStatus !== "paid")));
    socket.on("table:updated", (table: RestaurantTable) => setTables((current) => current.map((item) => (item._id === table._id ? { ...item, ...table } : item))));

    return () => {
      socket.off("order:created");
      socket.off("order:updated");
      socket.off("table:updated");
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

  const subtotal = cart.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;
  const itemQuantities = useMemo(
    () => new Map(cart.map((line) => [line.item._id, line.quantity])),
    [cart]
  );

  function addItem(item: MenuItem) {
    setCart((current) => {
      const existing = current.find((line) => line.item._id === item._id);
      if (existing) return current.map((line) => (line.item._id === item._id ? { ...line, quantity: line.quantity + 1 } : line));
      return [...current, { item, quantity: 1 }];
    });
  }

  function setQuantity(id: string, quantity: number) {
    setCart((current) => current.map((line) => (line.item._id === id ? { ...line, quantity } : line)).filter((line) => line.quantity > 0));
  }

  async function submitOrder() {
    if (!selectedTable || !cart.length) {
      setMessage("Select a table and add at least one dish.");
      return;
    }

    const order = await submitTableOrder({
      tableId: selectedTable._id,
      customerNotes,
      items: cart.map((line) => ({ menuItem: line.item._id, quantity: line.quantity, note: line.note }))
    });

    setOrders((current) => [order, ...current]);
    setCart([]);
    setCustomerNotes("");
    setMessage(`Order sent for table ${selectedTable.number}.`);
    setTables(await getTables());
  }

  async function changeStatus(order: Order, status: string) {
    const updated = status === "billing" ? await markBilling(order._id) : await updateOrderStatus(order._id, status);
    setOrders((current) => current.map((item) => (item._id === updated._id ? updated : item)));
  }

  async function openBill(order: Order) {
    const billData = await getBill(order._id);
    await markBilling(order._id);
    setBill({ ...billData.order, gst: billData.gst, total: billData.total, billNumber: billData.billNumber });
  }

  async function markPaid(method: "cash" | "card" | "upi") {
    if (!bill) return;
    await recordPayment(bill._id, method);
    setBill(null);
    setOrders(await getActiveOrders());
    setTables(await getTables());
  }

  return (
    <main className="grid gap-5 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="min-w-0 space-y-5 sm:space-y-6">
        <div>
          <p className="text-xs font-black uppercase text-gold-700">Waiter ordering</p>
          <h2 className="mt-1 text-2xl font-black leading-tight text-ink sm:text-3xl">Select table and add food items</h2>
        </div>
        <TableGrid tables={tables} selectedId={selectedTable?._id} onSelect={setSelectedTable} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-3 text-stone-400" size={17} />
            <Input className="pl-10" placeholder="Search menu items" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="hide-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
            {["All", ...categories.map((category) => category.name)].map((category) => (
              <Button key={category} variant={activeCategory === category ? "primary" : "ghost"} className="h-10 min-h-10 whitespace-nowrap px-4" onClick={() => setActiveCategory(category)}>
                {category}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleItems.map((item) => (
            <MenuCard
              key={item._id}
              item={item}
              onAdd={addItem}
              onQuantityChange={(menuItem, quantity) => setQuantity(menuItem._id, quantity)}
              quantity={itemQuantities.get(item._id) || 0}
            />
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-[8px] bg-forest-900 p-4 text-white shadow-glow sm:p-5 lg:sticky lg:top-20">
        <p className="text-xs font-black uppercase text-gold-300">Current cart</p>
        <h2 className="mt-1 text-2xl font-black">Table {selectedTable?.number || "-"}</h2>
        <div className="mt-5 space-y-3">
          {cart.map((line) => (
            <div key={line.item._id} className="rounded-[8px] bg-white/10 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words font-black">{line.item.name}</p>
                  <p className="text-sm text-white/70">{formatMoney(line.item.price)}</p>
                </div>
                <QuantityStepper value={line.quantity} onChange={(value) => setQuantity(line.item._id, value)} />
              </div>
            </div>
          ))}
          {!cart.length ? <p className="rounded-[8px] bg-white/10 p-4 text-sm font-bold text-white/74">Add dishes from the menu to create an order.</p> : null}
        </div>
        <textarea className="mt-4 min-h-24 w-full rounded-[8px] border border-white/10 bg-white/10 p-3 text-sm font-semibold text-white outline-none placeholder:text-white/45" placeholder="Customer notes" value={customerNotes} onChange={(event) => setCustomerNotes(event.target.value)} />
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
          <div className="flex justify-between"><span>GST 5%</span><strong>{formatMoney(gst)}</strong></div>
          <div className="flex justify-between text-lg"><span className="font-black">Total</span><strong>{formatMoney(total)}</strong></div>
        </div>
        {message ? <p className="mt-4 rounded-[8px] bg-gold-300 p-3 text-sm font-black text-forest-900">{message}</p> : null}
        <Button className="mt-5 w-full bg-gold-300 text-forest-900 hover:bg-gold-500" onClick={submitOrder}>
          <Send size={16} />
          Submit order
        </Button>
      </aside>
      <section className="min-w-0 lg:col-start-1">
        <h3 className="text-xl font-black text-ink">Active table orders</h3>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onStatus={changeStatus} onBill={openBill} />
          ))}
        </div>
      </section>
      <BillPreview order={bill} onClose={() => setBill(null)} onPaid={markPaid} />
    </main>
  );
}

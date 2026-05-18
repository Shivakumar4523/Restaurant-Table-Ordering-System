import { useEffect, useState } from "react";
import { ChefHat } from "lucide-react";
import { OrderCard } from "@/components/orders/OrderCard";
import { getActiveOrders, updateOrderStatus, type Order } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

export function KitchenDashboard() {
  const { socket } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    getActiveOrders().then(setOrders);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join:kitchen");
    socket.on("order:created", (order: Order) => setOrders((current) => [order, ...current.filter((item) => item._id !== order._id)]));
    socket.on("order:updated", (order: Order) => setOrders((current) => current.map((item) => (item._id === order._id ? order : item)).filter((item) => item.paymentStatus !== "paid")));

    return () => {
      socket.off("order:created");
      socket.off("order:updated");
    };
  }, [socket]);

  async function changeStatus(order: Order, status: string) {
    const updated = await updateOrderStatus(order._id, status);
    setOrders((current) => current.map((item) => (item._id === updated._id ? updated : item)));
  }

  return (
    <main className="w-full max-w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-gold-700">Kitchen dashboard</p>
          <h2 className="mt-1 break-words text-2xl font-black text-ink sm:text-3xl">Live incoming orders</h2>
        </div>
        <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-forest-700 px-4 py-2 text-sm font-black text-white sm:self-auto">
          <ChefHat size={17} />
          {orders.length} active
        </div>
      </div>
      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} onStatus={changeStatus} />
        ))}
      </div>
      {!orders.length ? <p className="mt-8 w-full max-w-full break-words rounded-[8px] border border-dashed border-black/20 p-8 text-center font-bold text-stone-600">No active kitchen orders yet.</p> : null}
    </main>
  );
}

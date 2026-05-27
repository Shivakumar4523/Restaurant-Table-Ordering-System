import { useEffect, useState } from "react";
import { Wine } from "lucide-react";
import { OrderCard } from "@/components/orders/OrderCard";
import { getActiveOrders, updateOrderStatus, type Order } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

function getBarStatus(order: Order) {
  return order.barStatus || order.status;
}

function getBarOrderItems(order: Order) {
  const fallbackStatus = getBarStatus(order);
  return order.items.filter((item) => {
    const isBarItem = item.itemType === "barItem" || item.barItem;
    return isBarItem && (item.stationStatus || fallbackStatus) !== "served";
  });
}

function isBarOrderVisible(order: Order) {
  return order.paymentStatus !== "paid" && getBarOrderItems(order).length > 0 && ["pending", "preparing", "ready"].includes(getBarStatus(order));
}

export function BarDashboard() {
  const { socket } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getActiveOrders()
      .then((records) => setOrders(records.filter(isBarOrderVisible)))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load bar orders."));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const syncCreatedOrder = (order: Order) => {
      if (!isBarOrderVisible(order)) return;
      setOrders((current) => [order, ...current.filter((item) => item._id !== order._id)]);
    };
    const syncUpdatedOrder = (order: Order) =>
      setOrders((current) => {
        const withoutOrder = current.filter((item) => item._id !== order._id);
        return isBarOrderVisible(order) ? [order, ...withoutOrder] : withoutOrder;
      });

    socket.emit("join:bar");
    socket.on("order:created", syncCreatedOrder);
    socket.on("order:updated", syncUpdatedOrder);

    return () => {
      socket.off("order:created", syncCreatedOrder);
      socket.off("order:updated", syncUpdatedOrder);
    };
  }, [socket]);

  async function changeStatus(order: Order, status: string) {
    const previousOrders = orders;
    const optimisticOrder = { ...order, barStatus: status as Order["barStatus"] };

    setUpdatingOrderId(order._id);
    setMessage("");
    setOrders((current) => current.map((item) => (item._id === order._id ? optimisticOrder : item)).filter(isBarOrderVisible));

    try {
      const updated = await updateOrderStatus(order._id, status, "bar");
      setOrders((current) => {
        const withoutOrder = current.filter((item) => item._id !== updated._id);
        return isBarOrderVisible(updated) ? [updated, ...withoutOrder] : withoutOrder;
      });
    } catch (error) {
      setOrders(previousOrders);
      setMessage(error instanceof Error ? error.message : "Unable to update bar order.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <main className="w-full max-w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-gold-700">Bar dashboard</p>
          <h2 className="mt-1 break-words text-2xl font-black text-ink sm:text-3xl">Live bar orders</h2>
        </div>
        <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-forest-700 px-4 py-2 text-sm font-black text-white sm:self-auto">
          <Wine size={17} />
          {orders.length} active
        </div>
      </div>

      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            items={getBarOrderItems(order)}
            status={getBarStatus(order)}
            stationLabel="Bar"
            onStatus={changeStatus}
            busy={updatingOrderId === order._id}
          />
        ))}
      </div>
      {message ? <p className="mt-4 rounded-[8px] bg-gold-100 p-3 text-sm font-black text-ink">{message}</p> : null}
      {!orders.length ? <p className="mt-8 w-full max-w-full break-words rounded-[8px] border border-dashed border-black/20 p-8 text-center font-bold text-stone-600">No active bar orders yet.</p> : null}
    </main>
  );
}

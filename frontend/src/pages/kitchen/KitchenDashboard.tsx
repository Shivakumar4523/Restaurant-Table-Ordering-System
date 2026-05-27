import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { AdminManagementTools, adminManagementTabs, type AdminManagementTab } from "@/pages/admin/AdminManagementTools";
import { OrderCard } from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { getActiveOrders, updateOrderStatus, type Order } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

type KitchenTab = "orders" | AdminManagementTab;

const kitchenTabs: KitchenTab[] = ["orders", ...adminManagementTabs];

function parseKitchenTab(value: string | null, isAdmin: boolean): KitchenTab {
  if (isAdmin && adminManagementTabs.includes(value as AdminManagementTab)) return value as AdminManagementTab;
  return "orders";
}

function getKitchenStatus(order: Order) {
  return order.kitchenStatus || order.status;
}

function getKitchenItems(order: Order) {
  const fallbackStatus = getKitchenStatus(order);
  return order.items.filter((item) => {
    const isKitchenItem = item.itemType !== "barItem" && !item.barItem;
    return isKitchenItem && (item.stationStatus || fallbackStatus) !== "served";
  });
}

function isKitchenOrderVisible(order: Order) {
  return order.paymentStatus !== "paid" && getKitchenItems(order).length > 0 && ["pending", "preparing", "ready"].includes(getKitchenStatus(order));
}

export function KitchenDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = user?.role === "admin";
  const [tab, setTab] = useState<KitchenTab>(() => parseKitchenTab(searchParams.get("tab"), isAdmin));
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const visibleTabs = useMemo(() => (isAdmin ? kitchenTabs : ["orders" as KitchenTab]), [isAdmin]);

  useEffect(() => {
    getActiveOrders()
      .then((records) => setOrders(records.filter(isKitchenOrderVisible)))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load kitchen orders."));
  }, []);

  useEffect(() => {
    setTab(parseKitchenTab(searchParams.get("tab"), isAdmin));
  }, [isAdmin, searchParams]);

  useEffect(() => {
    if (!socket) return;

    const syncCreatedOrder = (order: Order) => {
      if (!isKitchenOrderVisible(order)) return;
      setOrders((current) => [order, ...current.filter((item) => item._id !== order._id)]);
    };
    const syncUpdatedOrder = (order: Order) =>
      setOrders((current) => {
        const withoutOrder = current.filter((item) => item._id !== order._id);
        return isKitchenOrderVisible(order) ? [order, ...withoutOrder] : withoutOrder;
      });

    socket.emit("join:kitchen");
    socket.on("order:created", syncCreatedOrder);
    socket.on("order:updated", syncUpdatedOrder);

    return () => {
      socket.off("order:created", syncCreatedOrder);
      socket.off("order:updated", syncUpdatedOrder);
    };
  }, [socket]);

  async function changeStatus(order: Order, status: string) {
    const previousOrders = orders;
    const optimisticOrder = { ...order, kitchenStatus: status as Order["kitchenStatus"] };

    setUpdatingOrderId(order._id);
    setMessage("");
    setOrders((current) => current.map((item) => (item._id === order._id ? optimisticOrder : item)).filter(isKitchenOrderVisible));

    try {
      const updated = await updateOrderStatus(order._id, status, "kitchen");
      setOrders((current) => {
        const withoutOrder = current.filter((item) => item._id !== updated._id);
        return isKitchenOrderVisible(updated) ? [updated, ...withoutOrder] : withoutOrder;
      });
    } catch (error) {
      setOrders(previousOrders);
      setMessage(error instanceof Error ? error.message : "Unable to update order.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function selectTab(nextTab: KitchenTab) {
    const resolvedTab = isAdmin ? nextTab : "orders";
    setTab(resolvedTab);
    setSearchParams(resolvedTab === "orders" ? {} : { tab: resolvedTab }, { replace: true });
  }

  return (
    <main className="w-full max-w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-gold-700">Kitchen dashboard</p>
          <h2 className="mt-1 break-words text-2xl font-black text-ink sm:text-3xl">{tab === "orders" ? "Live incoming orders" : "Kitchen management"}</h2>
        </div>
        <div className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-forest-700 px-4 py-2 text-sm font-black text-white sm:self-auto">
          <ChefHat size={17} />
          {orders.length} active
        </div>
      </div>

      {visibleTabs.length > 1 ? (
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {visibleTabs.map((item) => (
            <Button key={item} variant={tab === item ? "primary" : "ghost"} className="h-10 min-h-10 capitalize" onClick={() => selectTab(item)}>
              {item}
            </Button>
          ))}
        </div>
      ) : null}

      {tab === "orders" ? (
        <>
          <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                items={getKitchenItems(order)}
                status={getKitchenStatus(order)}
                stationLabel="Kitchen"
                onStatus={changeStatus}
                busy={updatingOrderId === order._id}
              />
            ))}
          </div>
          {message ? <p className="mt-4 rounded-[8px] bg-gold-100 p-3 text-sm font-black text-ink">{message}</p> : null}
          {!orders.length ? <p className="mt-8 w-full max-w-full break-words rounded-[8px] border border-dashed border-black/20 p-8 text-center font-bold text-stone-600">No active kitchen orders yet.</p> : null}
        </>
      ) : (
        <AdminManagementTools tab={tab} />
      )}
    </main>
  );
}

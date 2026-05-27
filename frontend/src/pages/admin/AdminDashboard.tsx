import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { AdminManagementTools } from "@/pages/admin/AdminManagementTools";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { useSocket } from "@/context/SocketContext";
import { getMenuItems, getSalesReport, type MenuItem, type SalesReport } from "@/lib/api";
import { formatMoney } from "@/lib/constants";

type AdminTab = "overview" | "employees";

const adminTabs: AdminTab[] = ["overview", "employees"];

function upsertById<T extends { _id: string }>(records: T[], nextRecord: T) {
  return records.some((record) => record._id === nextRecord._id)
    ? records.map((record) => (record._id === nextRecord._id ? nextRecord : record))
    : [nextRecord, ...records];
}

function removeById<T extends { _id: string }>(records: T[], id: string) {
  return records.filter((record) => record._id !== id);
}

function parseAdminTab(value: string | null): AdminTab {
  return adminTabs.includes(value as AdminTab) ? (value as AdminTab) : "overview";
}

export function AdminDashboard() {
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<AdminTab>(() => parseAdminTab(searchParams.get("tab")));
  const [items, setItems] = useState<MenuItem[]>([]);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setMessage("");

    try {
      const [menuData, reportData] = await Promise.all([
        getMenuItems(),
        getSalesReport().catch(() => null)
      ]);
      setItems(menuData);
      setReport(reportData);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to refresh overview data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setTab(parseAdminTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    if (!socket) return;

    const syncMenuItem = (item: MenuItem) => {
      setItems((current) => (item.isAvailable === false ? removeById(current, item._id) : upsertById(current, item)));
    };

    socket.on("menu-item:updated", syncMenuItem);

    return () => {
      socket.off("menu-item:updated", syncMenuItem);
    };
  }, [socket]);

  function selectTab(nextTab: AdminTab) {
    setTab(nextTab);
    setSearchParams(nextTab === "overview" ? {} : { tab: nextTab }, { replace: true });
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-gold-700">Admin panel</p>
          <h2 className="mt-1 text-3xl font-black text-ink">{tab === "overview" ? "Restaurant overview" : "Employee management"}</h2>
        </div>
        {tab === "overview" ? (
          <Button variant="ghost" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : undefined} size={16} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        ) : null}
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {adminTabs.map((item) => (
          <Button key={item} variant={tab === item ? "primary" : "ghost"} className="h-10 min-h-10 capitalize" onClick={() => selectTab(item)}>
            {item}
          </Button>
        ))}
      </div>

      {message && tab === "overview" ? <p className="mt-4 rounded-[8px] bg-gold-100 p-3 text-sm font-black text-ink">{message}</p> : null}

      {tab === "overview" ? (
        <section className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Revenue" value={formatMoney(report?.revenue || 0)} />
            <StatCard label="GST collected" value={formatMoney(report?.gst || 0)} />
            <StatCard label="Paid bills" value={report?.paidBills || 0} />
            <StatCard label="Menu items" value={items.length} />
          </div>
          <div className="glass rounded-[8px] p-5">
            <h3 className="text-xl font-black text-ink">Sales report</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs uppercase text-stone-500">
                    <th className="py-3">Payment</th>
                    <th>Method</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th>Paid at</th>
                  </tr>
                </thead>
                <tbody>
                  {(report?.payments || []).map((payment) => (
                    <tr key={payment._id} className="border-b border-black/5">
                      <td className="py-3 font-black">#{payment._id.slice(-6).toUpperCase()}</td>
                      <td className="uppercase">{payment.method}</td>
                      <td>{formatMoney(payment.gst)}</td>
                      <td className="font-black">{formatMoney(payment.total)}</td>
                      <td>{new Date(payment.paidAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!report?.payments?.length ? <p className="py-8 text-center font-bold text-stone-600">No paid bills yet.</p> : null}
            </div>
          </div>
        </section>
      ) : (
        <AdminManagementTools tab="employees" />
      )}
    </main>
  );
}

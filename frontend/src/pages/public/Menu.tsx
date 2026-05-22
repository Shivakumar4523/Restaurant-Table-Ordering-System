import { useEffect, useMemo, useState } from "react";
import { MenuCard } from "@/components/menu/MenuCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSocket } from "@/context/SocketContext";
import { formatMoney } from "@/lib/constants";
import { getActiveCoupons, getCategories, getMenuItems, type Category, type Coupon, type MenuItem } from "@/lib/api";

function mergeMenuItem(records: MenuItem[], item: MenuItem) {
  if (item.isAvailable === false) return records.filter((record) => record._id !== item._id);

  const nextRecords = records.some((record) => record._id === item._id)
    ? records.map((record) => (record._id === item._id ? item : record))
    : [item, ...records];

  return nextRecords.sort((a, b) => {
    if (Boolean(a.isFeatured) !== Boolean(b.isFeatured)) return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
    return a.categoryName.localeCompare(b.categoryName) || a.name.localeCompare(b.name);
  });
}

export function Menu() {
  const { socket } = useSocket();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    getCategories().then(setCategories);
    getMenuItems().then(setItems);
    getActiveCoupons().then(setCoupons).catch(() => setCoupons([]));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const syncMenuItem = (item: MenuItem) => setItems((current) => mergeMenuItem(current, item));
    socket.on("menu-item:updated", syncMenuItem);

    return () => {
      socket.off("menu-item:updated", syncMenuItem);
    };
  }, [socket]);

  const visible = useMemo(() => {
    const normalized = query.toLowerCase();
    return items.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.categoryName === activeCategory;
      const matchesQuery = !normalized || [item.name, item.description, item.categoryName, ...(item.tags || [])].join(" ").toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, items, query]);

  return (
    <main className="w-full max-w-none px-0 py-10">
      <div className="grid w-full gap-4 px-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-end sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-black uppercase text-gold-700">Public menu</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Royal Spice Menu</h1>
        </div>
        <Input placeholder="Search menu items" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
        {["All", ...categories.map((category) => category.name)].map((category) => (
          <Button key={category} variant={activeCategory === category ? "primary" : "ghost"} className="h-10 min-h-10 whitespace-nowrap px-4" onClick={() => setActiveCategory(category)}>
            {category}
          </Button>
        ))}
      </div>
      {coupons.length ? (
        <div className="mt-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="min-w-64 rounded-[8px] border border-gold-300 bg-gold-100 p-4 text-ink">
              <p className="text-xs font-black uppercase text-gold-700">Offer code</p>
              <p className="mt-1 text-2xl font-black">{coupon.code}</p>
              <p className="mt-1 text-sm font-bold">
                {coupon.type === "percent" ? `${coupon.value}% off` : `${formatMoney(coupon.value)} off`} over {formatMoney(coupon.minOrder)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-6 grid w-full min-w-0 grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8 2xl:grid-cols-4">
        {visible.map((item) => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </main>
  );
}

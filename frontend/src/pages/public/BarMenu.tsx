import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Search, ShoppingBag, Wine } from "lucide-react";
import { CategoryFilter } from "@/components/bar/CategoryFilter";
import { PegSizeSelector } from "@/components/bar/PegSizeSelector";
import { StockStatusBadge } from "@/components/bar/StockStatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDebounce } from "@/hooks/useDebounce";
import { getDefaultPegSize, getPegLabel, getPegPrice, isOutOfStock, pegOptions } from "@/lib/bar";
import { formatMoney } from "@/lib/constants";
import { getBarItems, resolveAssetUrl, type BarItem, type BarItemsPagination, type BarPegSize } from "@/lib/api";

type CartLine = {
  key: string;
  item: BarItem;
  pegSize: BarPegSize;
  quantity: number;
  price: number;
};

function cartKey(item: BarItem, pegSize: BarPegSize) {
  return `${item._id}:${pegSize}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function DrinkSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-[8px] border border-gold-300/10 bg-white/10" />
      ))}
    </>
  );
}

function CustomerDrinkCard({ item, onAdd }: { item: BarItem; onAdd: (item: BarItem, pegSize: BarPegSize) => void }) {
  const [pegSize, setPegSize] = useState<BarPegSize>(() => getDefaultPegSize(item));
  const selectedPrice = getPegPrice(item, pegSize);
  const unavailable = isOutOfStock(item) || selectedPrice <= 0;

  useEffect(() => {
    setPegSize(getDefaultPegSize(item));
  }, [item]);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-[8px] border border-gold-300/20 bg-[#071b13] shadow-gold"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
        {item.image ? (
          <img src={resolveAssetUrl(item.image)} alt={item.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-gold-300">
            <Wine size={40} />
          </div>
        )}
        {isOutOfStock(item) ? (
          <div className="absolute inset-x-3 top-3 rounded-[8px] border border-red-300/30 bg-red-500/25 px-3 py-2 text-xs font-black uppercase text-red-100 backdrop-blur">
            Out of stock
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-gold-300">{item.category}</p>
            <h3 className="mt-1 break-words text-lg font-black text-white">{item.name}</h3>
            <p className="mt-1 text-sm font-semibold text-white/60">{item.brand || item.alcoholType || (item.isAlcoholic ? "Bar pour" : "Non-alcoholic")}</p>
          </div>
          <StockStatusBadge stock={item.stock} isAvailable={item.isAvailable} />
        </div>

        <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-white/65">{item.description || `${item.mlSize || ""}ml ${item.alcoholType || "drink"}`}</p>

        <div className="mt-4">
          <PegSizeSelector item={item} value={pegSize} onChange={setPegSize} compact />
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <div>
            <p className="text-xs font-black uppercase text-white/45">Selected</p>
            <p className="mt-1 text-xl font-black text-gold-300">{selectedPrice ? formatMoney(selectedPrice) : "N/A"}</p>
          </div>
          <Button type="button" variant="secondary" disabled={unavailable} onClick={() => onAdd(item, pegSize)}>
            <Plus size={16} />
            Add
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function BarMenu() {
  const [items, setItems] = useState<BarItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);
  const [pagination, setPagination] = useState<BarItemsPagination>({ page: 1, limit: 9, total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, debouncedQuery]);

  useEffect(() => {
    let active = true;

    async function loadDrinks() {
      setLoading(true);
      try {
        const response = await getBarItems({
          q: debouncedQuery || undefined,
          category: activeCategory === "All" ? undefined : activeCategory,
          page,
          limit: pagination.limit
        });

        if (!active) return;
        setItems(response.barItems);
        setCategories(response.categories);
        setPagination(response.pagination);
      } catch (error) {
        if (active) setMessage(getErrorMessage(error, "Unable to load bar menu."));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDrinks();
    return () => {
      active = false;
    };
  }, [activeCategory, debouncedQuery, page, pagination.limit]);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: pagination.total };
    for (const item of items) counts[item.category] = (counts[item.category] || 0) + 1;
    return counts;
  }, [items, pagination.total]);

  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const gst = cart.reduce((sum, line) => sum + Math.round((line.price * line.quantity * Number(line.item.gstPercentage || 0)) / 100), 0);
  const total = subtotal + gst;

  function addToCart(item: BarItem, pegSize: BarPegSize) {
    const price = getPegPrice(item, pegSize);
    if (isOutOfStock(item) || price <= 0) return;

    const key = cartKey(item, pegSize);
    setCart((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing) return current.map((line) => (line.key === key ? { ...line, quantity: line.quantity + 1 } : line));
      return [...current, { key, item, pegSize, quantity: 1, price }];
    });
    setMessage(`${item.name} ${getPegLabel(pegSize)} added.`);
  }

  function updateQuantity(key: string, quantity: number) {
    setCart((current) => current.map((line) => (line.key === key ? { ...line, quantity } : line)).filter((line) => line.quantity > 0));
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gold-300">Bar menu</p>
                <h1 className="mt-2 text-4xl font-black text-white">Drinks</h1>
              </div>
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-3 text-gold-300" size={17} />
                <Input
                  className="border-gold-300/20 bg-[#071b13] pl-10 text-white placeholder:text-white/45"
                  placeholder="Search drinks"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-5">
              <CategoryFilter categories={categories} activeCategory={activeCategory} onChange={setActiveCategory} counts={categoryCounts} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {loading ? <DrinkSkeleton /> : items.map((item) => <CustomerDrinkCard key={item._id} item={item} onAdd={addToCart} />)}
            </div>

            {!loading && !items.length ? (
              <p className="mt-8 rounded-[8px] border border-gold-300/20 bg-[#071b13] p-8 text-center text-sm font-bold text-white/60">No drinks found.</p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-white/55">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" className="h-10 min-h-10 border-gold-300/20 bg-white/5 px-4 text-white" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                  Previous
                </Button>
                <Button type="button" variant="secondary" className="h-10 min-h-10 px-4" disabled={page >= pagination.pages || loading} onClick={() => setPage((value) => value + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-[8px] border border-gold-300/20 bg-[#071b13] p-4 shadow-glow lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-gold-300">Current order</p>
                <h2 className="mt-1 text-2xl font-black text-white">Bar Cart</h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-300 text-forest-900">
                <ShoppingBag size={20} />
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {cart.map((line) => (
                <div key={line.key} className="rounded-[8px] border border-gold-300/20 bg-black/25 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-black text-white">{line.item.name}</p>
                      <p className="mt-1 text-sm font-semibold text-white/60">
                        {getPegLabel(line.pegSize)} | {formatMoney(line.price)}
                      </p>
                    </div>
                    <div className="grid h-10 w-[116px] shrink-0 grid-cols-[34px_48px_34px] overflow-hidden rounded-full border border-gold-300/20 bg-white/5">
                      <button type="button" className="grid place-items-center text-gold-300 hover:bg-white/10" onClick={() => updateQuantity(line.key, line.quantity - 1)} aria-label={`Decrease ${line.item.name}`}>
                        <Minus size={15} />
                      </button>
                      <span className="grid place-items-center bg-white/10 text-sm font-black">{line.quantity}</span>
                      <button type="button" className="grid place-items-center text-gold-300 hover:bg-white/10" onClick={() => updateQuantity(line.key, line.quantity + 1)} aria-label={`Increase ${line.item.name}`}>
                        <Plus size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!cart.length ? <p className="rounded-[8px] bg-white/5 p-4 text-sm font-bold text-white/60">No drinks selected.</p> : null}
            </div>

            <div className="mt-5 space-y-2 border-t border-gold-300/10 pt-4 text-sm">
              <div className="flex justify-between gap-3 text-white/70">
                <span>Subtotal</span>
                <strong className="text-white">{formatMoney(subtotal)}</strong>
              </div>
              <div className="flex justify-between gap-3 text-white/70">
                <span>GST</span>
                <strong className="text-white">{formatMoney(gst)}</strong>
              </div>
              <div className="flex justify-between gap-3 text-lg">
                <span className="font-black text-white">Total</span>
                <strong className="text-gold-300">{formatMoney(total)}</strong>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {pegOptions.map((option) => (
                <div key={option.value} className="rounded-[8px] bg-white/5 p-2 text-center">
                  <p className="text-xs font-black uppercase text-gold-300">{option.label}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {message ? <div className="fixed right-4 top-20 z-50 rounded-[8px] border border-gold-300/25 bg-gold-300 px-4 py-3 text-sm font-black text-forest-900 shadow-glow">{message}</div> : null}
    </main>
  );
}

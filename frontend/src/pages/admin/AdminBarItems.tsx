import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PackageCheck, Plus, RefreshCw, Search, SlidersHorizontal, Wine } from "lucide-react";
import { AddDrinkModal } from "@/components/bar/AddDrinkModal";
import { AdminBarItemTable } from "@/components/bar/AdminBarItemTable";
import { CategoryFilter } from "@/components/bar/CategoryFilter";
import { DeleteConfirmationModal } from "@/components/bar/DeleteConfirmationModal";
import { EditDrinkModal } from "@/components/bar/EditDrinkModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDebounce } from "@/hooks/useDebounce";
import { BAR_CATEGORIES } from "@/lib/bar";
import { deleteBarItem, getBarItems, saveBarItemForm, type BarItem, type BarItemsPagination } from "@/lib/api";

type StockFilter = "all" | "in" | "low" | "out";
type Toast = { message: string; tone: "success" | "error" };

const stockFilters: Array<{ value: StockFilter; label: string }> = [
  { value: "all", label: "All stock" },
  { value: "in", label: "In stock" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" }
];

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AdminBarItems() {
  const [items, setItems] = useState<BarItem[]>([]);
  const [categories, setCategories] = useState<string[]>(BAR_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);
  const [pagination, setPagination] = useState<BarItemsPagination>({ page: 1, limit: 8, total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BarItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<BarItem | null>(null);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, debouncedQuery, stockFilter]);

  useEffect(() => {
    let active = true;

    async function loadBarItems() {
      setLoading(true);
      try {
        const response = await getBarItems({
          q: debouncedQuery || undefined,
          category: activeCategory === "All" ? undefined : activeCategory,
          stockStatus: stockFilter === "all" ? undefined : stockFilter,
          page,
          limit: pagination.limit
        });

        if (!active) return;

        setItems(response.barItems);
        setCategories(response.categories.length ? response.categories : BAR_CATEGORIES);
        setPagination(response.pagination);
      } catch (error) {
        if (active) setToast({ tone: "error", message: getErrorMessage(error, "Unable to load bar items.") });
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBarItems();
    return () => {
      active = false;
    };
  }, [activeCategory, debouncedQuery, page, pagination.limit, refreshToken, stockFilter]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const currentPageCounts = useMemo(() => {
    const counts: Record<string, number> = { All: pagination.total };
    for (const item of items) counts[item.category] = (counts[item.category] || 0) + 1;
    return counts;
  }, [items, pagination.total]);

  const visibleStats = useMemo(() => {
    const out = items.filter((item) => !item.isAvailable || item.stock <= 0).length;
    const low = items.filter((item) => item.isAvailable && item.stock > 0 && item.stock <= 5).length;
    return {
      pageItems: items.length,
      low,
      out
    };
  }, [items]);

  async function handleAdd(formData: FormData) {
    setSaving(true);
    try {
      await saveBarItemForm(formData);
      setToast({ tone: "success", message: "Drink added to bar inventory." });
      setAddOpen(false);
      setPage(1);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setToast({ tone: "error", message: getErrorMessage(error, "Unable to add drink.") });
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(formData: FormData) {
    if (!editingItem) return;

    setSaving(true);
    try {
      await saveBarItemForm(formData, editingItem._id);
      setToast({ tone: "success", message: "Drink updated." });
      setEditingItem(null);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setToast({ tone: "error", message: getErrorMessage(error, "Unable to update drink.") });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingItem) return;

    setSaving(true);
    try {
      await deleteBarItem(deletingItem._id);
      setToast({ tone: "success", message: `${deletingItem.name} deleted.` });
      setDeletingItem(null);
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setToast({ tone: "error", message: getErrorMessage(error, "Unable to delete drink.") });
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAvailability(item: BarItem) {
    const formData = new FormData();
    formData.set("isAvailable", String(!item.isAvailable));

    try {
      const updated = await saveBarItemForm(formData, item._id);
      setItems((current) => current.map((record) => (record._id === updated._id ? updated : record)));
      setToast({ tone: "success", message: `${updated.name} marked ${updated.isAvailable ? "available" : "unavailable"}.` });
    } catch (error) {
      setToast({ tone: "error", message: getErrorMessage(error, "Unable to update stock status.") });
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-gold-300">Admin items page</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">Bar Management</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/65">Premium bar inventory, pricing, and stock control.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" className="border-gold-300/20 bg-white/5 text-white hover:bg-white/10" onClick={() => setRefreshToken((value) => value + 1)} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : undefined} size={16} />
              Refresh
            </Button>
            <Button type="button" variant="secondary" onClick={() => setAddOpen(true)}>
              <Plus size={16} />
              Add drink
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { label: "Loaded drinks", value: visibleStats.pageItems, icon: Wine },
            { label: "Low stock", value: visibleStats.low, icon: SlidersHorizontal },
            { label: "Out of stock", value: visibleStats.out, icon: PackageCheck }
          ].map(({ label, value, icon: Icon }) => (
            <motion.div key={label} whileHover={{ y: -3 }} className="rounded-[8px] border border-gold-300/20 bg-[#071b13] p-4 shadow-gold">
              <Icon className="text-gold-300" size={20} />
              <p className="mt-3 text-xs font-black uppercase text-white/50">{label}</p>
              <p className="mt-1 text-3xl font-black text-white">{value}</p>
            </motion.div>
          ))}
        </div>

        <section className="mt-6 rounded-[8px] border border-gold-300/20 bg-[#071b13] p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(16rem,28rem)_220px] xl:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gold-300" size={17} />
              <Input
                className="border-gold-300/20 bg-black/30 pl-10 text-white placeholder:text-white/45"
                placeholder="Search drinks, brands, category"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value as StockFilter)}
              className="h-11 rounded-[8px] border border-gold-300/20 bg-black/30 px-3 text-sm font-black text-white outline-none"
            >
              {stockFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <CategoryFilter categories={categories} activeCategory={activeCategory} onChange={setActiveCategory} counts={currentPageCounts} />
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <AdminBarItemTable
            items={items}
            loading={loading}
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={setPage}
            onEdit={setEditingItem}
            onDelete={setDeletingItem}
            onToggleAvailability={handleToggleAvailability}
          />

          <aside className="h-fit rounded-[8px] border border-gold-300/20 bg-[#071b13] p-4 shadow-glow">
            <p className="text-xs font-black uppercase text-gold-300">Manage categories</p>
            <h2 className="mt-1 text-xl font-black text-white">Bar Categories</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-1">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="rounded-[8px] border border-gold-300/15 bg-white/5 px-3 py-2 text-left text-sm font-black text-white transition hover:border-gold-300/60 hover:bg-white/10"
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                  {currentPageCounts[category] ? <span className="float-right text-gold-300">{currentPageCounts[category]}</span> : null}
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {toast ? (
        <div
          className={`fixed right-4 top-20 z-50 max-w-sm rounded-[8px] border px-4 py-3 text-sm font-black shadow-glow ${
            toast.tone === "success" ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100" : "border-red-400/30 bg-red-500/15 text-red-100"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <AddDrinkModal open={addOpen} categories={categories} busy={saving} onClose={() => setAddOpen(false)} onSave={handleAdd} />
      <EditDrinkModal item={editingItem} categories={categories} busy={saving} onClose={() => setEditingItem(null)} onSave={handleEdit} />
      <DeleteConfirmationModal itemName={deletingItem?.name} busy={saving} onCancel={() => setDeletingItem(null)} onConfirm={handleDelete} />
    </main>
  );
}

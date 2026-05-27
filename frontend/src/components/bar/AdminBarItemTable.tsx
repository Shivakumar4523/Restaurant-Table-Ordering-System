import { Edit2, Power, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { StockStatusBadge } from "@/components/bar/StockStatusBadge";
import { formatMoney } from "@/lib/constants";
import { resolveAssetUrl, type BarItem } from "@/lib/api";

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-gold-300/10">
          <td className="py-4" colSpan={8}>
            <div className="h-12 animate-pulse rounded-[8px] bg-white/10" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function AdminBarItemTable({
  items,
  loading,
  page,
  pages,
  total,
  onPageChange,
  onEdit,
  onDelete,
  onToggleAvailability
}: {
  items: BarItem[];
  loading: boolean;
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (item: BarItem) => void;
  onDelete: (item: BarItem) => void;
  onToggleAvailability: (item: BarItem) => void;
}) {
  return (
    <section className="rounded-[8px] border border-gold-300/20 bg-[#071b13] shadow-glow">
      <div className="flex flex-col gap-2 border-b border-gold-300/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-gold-300">Admin item management</p>
          <h2 className="mt-1 text-xl font-black text-white">Bar items</h2>
        </div>
        <p className="text-sm font-bold text-white/60">{total} drink{total === 1 ? "" : "s"}</p>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-gold-300/10 text-xs uppercase text-white/50">
              <th className="px-4 py-3">Drink</th>
              <th>Category</th>
              <th>Brand</th>
              <th>30ml</th>
              <th>60ml</th>
              <th>Bottle</th>
              <th>Stock</th>
              <th className="pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton /> : null}
            {!loading
              ? items.map((item) => (
                  <tr key={item._id} className="border-b border-gold-300/10 text-white/80 transition hover:bg-white/5">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 overflow-hidden rounded-[8px] border border-gold-300/20 bg-black/40">
                          {item.image ? <img src={resolveAssetUrl(item.image)} alt={item.name} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-white">{item.name}</p>
                          <p className="mt-1 max-w-60 truncate text-xs font-bold text-white/55">{item.description || item.alcoholType || "No description"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-bold">{item.category}</td>
                    <td>{item.brand || "-"}</td>
                    <td className="font-black text-gold-300">{item.prices.smallPeg ? formatMoney(item.prices.smallPeg) : "-"}</td>
                    <td className="font-black text-gold-300">{item.prices.largePeg ? formatMoney(item.prices.largePeg) : "-"}</td>
                    <td className="font-black text-gold-300">{item.prices.bottle ? formatMoney(item.prices.bottle) : "-"}</td>
                    <td>
                      <StockStatusBadge stock={item.stock} isAvailable={item.isAvailable} />
                    </td>
                    <td className="pr-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-10 min-h-10 border-gold-300/20 bg-white/5 px-3 text-white"
                          onClick={() => onToggleAvailability(item)}
                          aria-label={`${item.isAvailable ? "Mark unavailable" : "Mark available"} ${item.name}`}
                          title={item.isAvailable ? "Mark unavailable" : "Mark available"}
                        >
                          <Power size={15} />
                        </Button>
                        <Button type="button" variant="ghost" className="h-10 min-h-10 border-gold-300/20 bg-white/5 px-3 text-white" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}>
                          <Edit2 size={15} />
                        </Button>
                        <Button type="button" variant="danger" className="h-10 min-h-10 px-3" onClick={() => onDelete(item)} aria-label={`Delete ${item.name}`}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-4 lg:hidden">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-[8px] bg-white/10" />)
          : items.map((item) => (
              <motion.article
                key={item._id}
                whileHover={{ y: -2 }}
                className="rounded-[8px] border border-gold-300/20 bg-white/5 p-3"
              >
                <div className="flex gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[8px] border border-gold-300/20 bg-black/40">
                    {item.image ? <img src={resolveAssetUrl(item.image)} alt={item.name} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase text-gold-300">{item.category}</p>
                    <h3 className="mt-1 break-words font-black text-white">{item.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-white/60">{item.brand || item.alcoholType || "Bar item"}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-[8px] bg-black/25 p-2"><span className="block text-xs text-white/45">30ml</span><b>{item.prices.smallPeg ? formatMoney(item.prices.smallPeg) : "-"}</b></div>
                  <div className="rounded-[8px] bg-black/25 p-2"><span className="block text-xs text-white/45">60ml</span><b>{item.prices.largePeg ? formatMoney(item.prices.largePeg) : "-"}</b></div>
                  <div className="rounded-[8px] bg-black/25 p-2"><span className="block text-xs text-white/45">Bottle</span><b>{item.prices.bottle ? formatMoney(item.prices.bottle) : "-"}</b></div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <StockStatusBadge stock={item.stock} isAvailable={item.isAvailable} />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-10 min-h-10 border-gold-300/20 bg-white/5 px-3 text-white"
                      onClick={() => onToggleAvailability(item)}
                      aria-label={`${item.isAvailable ? "Mark unavailable" : "Mark available"} ${item.name}`}
                    >
                      <Power size={15} />
                    </Button>
                    <Button type="button" variant="ghost" className="h-10 min-h-10 border-gold-300/20 bg-white/5 px-3 text-white" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}>
                      <Edit2 size={15} />
                    </Button>
                    <Button type="button" variant="danger" className="h-10 min-h-10 px-3" onClick={() => onDelete(item)} aria-label={`Delete ${item.name}`}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
      </div>

      {!loading && !items.length ? <p className="p-8 text-center text-sm font-bold text-white/60">No bar items found.</p> : null}

      <div className="flex flex-col gap-3 border-t border-gold-300/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-white/55">
          Page {page} of {pages}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" className="h-10 min-h-10 border-gold-300/20 bg-white/5 px-4 text-white" disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <Button type="button" variant="secondary" className="h-10 min-h-10 px-4" disabled={page >= pages || loading} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}

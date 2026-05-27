import { motion } from "framer-motion";
import { DrinkFormFields } from "@/components/bar/DrinkFormFields";
import type { BarItem } from "@/lib/api";

export function EditDrinkModal({
  item,
  categories,
  busy,
  onClose,
  onSave
}: {
  item: BarItem | null;
  categories: string[];
  busy?: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/78 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-3xl rounded-[8px] border border-gold-300/20 bg-[#06130e] p-5 text-white shadow-glow"
      >
        <div className="mb-5">
          <p className="text-xs font-black uppercase text-gold-300">{item.category}</p>
          <h2 className="mt-1 text-2xl font-black text-white">Edit {item.name}</h2>
        </div>
        <DrinkFormFields item={item} categories={categories} busy={busy} submitLabel="Update drink" onSubmit={onSave} onCancel={onClose} />
      </motion.div>
    </div>
  );
}


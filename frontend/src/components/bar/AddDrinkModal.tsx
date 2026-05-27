import { motion } from "framer-motion";
import { DrinkFormFields } from "@/components/bar/DrinkFormFields";

export function AddDrinkModal({
  open,
  categories,
  busy,
  onClose,
  onSave
}: {
  open: boolean;
  categories: string[];
  busy?: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/78 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-3xl rounded-[8px] border border-gold-300/20 bg-[#06130e] p-5 text-white shadow-glow"
      >
        <div className="mb-5">
          <p className="text-xs font-black uppercase text-gold-300">Bar inventory</p>
          <h2 className="mt-1 text-2xl font-black text-white">Add new drink</h2>
        </div>
        <DrinkFormFields categories={categories} busy={busy} submitLabel="Save drink" onSubmit={onSave} onCancel={onClose} />
      </motion.div>
    </div>
  );
}


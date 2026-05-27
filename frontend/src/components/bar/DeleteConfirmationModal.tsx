import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function DeleteConfirmationModal({
  itemName,
  busy,
  onCancel,
  onConfirm
}: {
  itemName?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!itemName) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/78 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-[8px] border border-red-400/30 bg-[#06130e] p-5 text-white shadow-glow"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-200">
            <AlertTriangle size={22} />
          </span>
          <div>
            <h2 className="text-xl font-black">Delete drink?</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
              This will permanently remove <span className="font-black text-white">{itemName}</span> from the bar menu and admin inventory.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={onCancel}>
            <X size={16} />
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={busy} onClick={onConfirm}>
            <Trash2 size={16} />
            {busy ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}


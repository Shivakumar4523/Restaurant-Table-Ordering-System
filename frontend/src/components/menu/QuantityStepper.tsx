import { Minus, Plus } from "lucide-react";

export function QuantityStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="inline-grid grid-cols-[36px_42px_36px] items-center overflow-hidden rounded-full border border-black/10 bg-white">
      <button className="grid h-9 place-items-center text-forest-700" onClick={() => onChange(Math.max(0, value - 1))} type="button" aria-label="Decrease">
        <Minus size={15} />
      </button>
      <span className="text-center text-sm font-black">{value}</span>
      <button className="grid h-9 place-items-center text-forest-700" onClick={() => onChange(value + 1)} type="button" aria-label="Increase">
        <Plus size={15} />
      </button>
    </div>
  );
}

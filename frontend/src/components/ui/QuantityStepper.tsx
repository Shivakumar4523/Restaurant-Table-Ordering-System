"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-grid h-10 grid-cols-[40px_36px_40px] overflow-hidden rounded-full border border-black/10 bg-white text-sm font-black shadow-sm dark:border-white/10 dark:bg-white/10">
      <button className="grid place-items-center" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease">
        <Minus size={15} />
      </button>
      <span className="grid place-items-center">{value}</span>
      <button className="grid place-items-center" onClick={() => onChange(value + 1)} aria-label="Increase">
        <Plus size={15} />
      </button>
    </div>
  );
}

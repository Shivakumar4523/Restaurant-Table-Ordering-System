import { FormEvent } from "react";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/bar/ImageUploader";
import { Input } from "@/components/ui/Input";
import type { BarItem } from "@/lib/api";

const inputClass = "border-gold-300/20 bg-black/30 text-white placeholder:text-white/45";
const selectClass = "h-11 w-full rounded-[8px] border border-gold-300/20 bg-black/30 px-3 text-sm font-semibold text-white outline-none transition focus:border-gold-300";
const textareaClass = "min-h-24 rounded-[8px] border border-gold-300/20 bg-black/30 p-3 text-sm font-semibold text-white outline-none placeholder:text-white/45 focus:border-gold-300";

export function DrinkFormFields({
  item,
  categories,
  busy,
  submitLabel,
  onSubmit,
  onCancel
}: {
  item?: BarItem;
  categories: string[];
  busy?: boolean;
  submitLabel: string;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <ImageUploader initialUrl={item?.image} />

      <div className="grid gap-3 md:grid-cols-2">
        <Input className={inputClass} name="itemName" placeholder="Drink name" defaultValue={item?.name || ""} required />
        <select name="category" defaultValue={item?.category || categories[0] || "Beer"} className={selectClass} required>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <textarea name="description" className={textareaClass} placeholder="Description" defaultValue={item?.description || ""} />

      <div className="grid gap-3 md:grid-cols-3">
        <Input className={inputClass} name="price30ml" type="number" min={0} step={1} placeholder="30ml price" defaultValue={item?.prices?.smallPeg || ""} />
        <Input className={inputClass} name="price60ml" type="number" min={0} step={1} placeholder="60ml price" defaultValue={item?.prices?.largePeg || ""} />
        <Input className={inputClass} name="fullBottlePrice" type="number" min={0} step={1} placeholder="Bottle price" defaultValue={item?.prices?.bottle || ""} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Input className={inputClass} name="stockQuantity" type="number" min={0} step={1} placeholder="Stock quantity" defaultValue={item?.stock ?? ""} required />
        <Input className={inputClass} name="preparationTime" type="number" min={0} step={1} placeholder="Prep min" defaultValue={item?.preparationTime ?? 5} />
        <Input className={inputClass} name="gstPercentage" type="number" min={0} max={100} step={0.01} placeholder="GST %" defaultValue={item?.gstPercentage ?? 18} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Input className={inputClass} name="brand" placeholder="Brand" defaultValue={item?.brand || ""} />
        <Input className={inputClass} name="alcoholType" placeholder="Alcohol type" defaultValue={item?.alcoholType || ""} />
        <Input className={inputClass} name="mlSize" type="number" min={0} step={1} placeholder="Bottle ml size" defaultValue={item?.mlSize || ""} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <select name="isAvailable" defaultValue={String(item?.isAvailable ?? true)} className={selectClass}>
          <option value="true">Available</option>
          <option value="false">Out of stock</option>
        </select>
        <select name="isAlcoholic" defaultValue={String(item?.isAlcoholic ?? true)} className={selectClass}>
          <option value="true">Alcoholic</option>
          <option value="false">Non-alcoholic</option>
        </select>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={onCancel}>
          <X size={16} />
          Cancel
        </Button>
        <Button type="submit" variant="secondary" disabled={busy}>
          <Save size={16} />
          {busy ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}


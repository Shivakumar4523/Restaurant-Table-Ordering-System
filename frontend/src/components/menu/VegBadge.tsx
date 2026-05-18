export function VegBadge({ type }: { type: "veg" | "non-veg" }) {
  const isVeg = type === "veg";
  return (
    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-[4px] border ${isVeg ? "border-emerald-600" : "border-red-600"}`} title={isVeg ? "Veg" : "Non-veg"}>
      <span className={`h-2.5 w-2.5 rounded-full ${isVeg ? "bg-emerald-600" : "bg-red-600"}`} />
    </span>
  );
}

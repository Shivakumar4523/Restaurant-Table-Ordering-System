import clsx from "clsx";

export function CategoryFilter({
  categories,
  activeCategory,
  onChange,
  counts
}: {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
  counts?: Record<string, number>;
}) {
  const options = ["All", ...categories];

  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1" aria-label="Filter drinks by category">
      {options.map((category) => (
        <button
          key={category}
          type="button"
          className={clsx(
            "h-10 shrink-0 rounded-full border px-4 text-sm font-black transition",
            activeCategory === category
              ? "border-gold-300 bg-gold-300 text-forest-900 shadow-gold"
              : "border-gold-300/20 bg-white/5 text-white hover:border-gold-300/60 hover:bg-white/10"
          )}
          onClick={() => onChange(category)}
        >
          {category}
          {counts?.[category] ? <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-xs">{counts[category]}</span> : null}
        </button>
      ))}
    </div>
  );
}


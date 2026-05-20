import { useEffect, useMemo, useState } from "react";
import { MenuCard } from "@/components/menu/MenuCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getCategories, getMenuItems, type Category, type MenuItem } from "@/lib/api";

export function Menu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    getCategories().then(setCategories);
    getMenuItems().then(setItems);
  }, []);

  const visible = useMemo(() => {
    const normalized = query.toLowerCase();
    return items.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.categoryName === activeCategory;
      const matchesQuery = !normalized || [item.name, item.description, item.categoryName, ...(item.tags || [])].join(" ").toLowerCase().includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, items, query]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-gold-700">Public menu</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Royal Spice Menu</h1>
        </div>
        <Input className="max-w-md" placeholder="Search menu items" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {["All", ...categories.map((category) => category.name)].map((category) => (
          <Button key={category} variant={activeCategory === category ? "primary" : "ghost"} className="h-10 min-h-10 whitespace-nowrap px-4" onClick={() => setActiveCategory(category)}>
            {category}
          </Button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))]">
        {visible.map((item) => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </main>
  );
}

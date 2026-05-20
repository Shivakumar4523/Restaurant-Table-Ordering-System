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
    <main className="w-full max-w-none px-0 py-10">
      <div className="grid w-full gap-4 px-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,32rem)] md:items-end sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-black uppercase text-gold-700">Public menu</p>
          <h1 className="mt-2 text-4xl font-black text-ink">Royal Spice Menu</h1>
        </div>
        <Input placeholder="Search menu items" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
        {["All", ...categories.map((category) => category.name)].map((category) => (
          <Button key={category} variant={activeCategory === category ? "primary" : "ghost"} className="h-10 min-h-10 whitespace-nowrap px-4" onClick={() => setActiveCategory(category)}>
            {category}
          </Button>
        ))}
      </div>
      <div className="mt-6 grid w-full min-w-0 grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8 2xl:grid-cols-4">
        {visible.map((item) => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </main>
  );
}

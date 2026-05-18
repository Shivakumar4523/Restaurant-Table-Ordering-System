import { Link, NavLink, Outlet } from "react-router-dom";
import { ChefHat, LogIn, Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function PublicLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-restaurant-radial">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-700 text-gold-300 shadow-glow">
              <Utensils size={23} />
            </span>
            <span>
              <span className="block text-lg font-black leading-5 text-ink">Royal Spice</span>
              <span className="block text-xs font-bold uppercase text-gold-700">Restaurant</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-black transition ${isActive ? "bg-forest-700 text-white" : "text-stone-700 hover:bg-white"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link to={user ? (user.role === "kitchen" ? "/kitchen" : user.role === "admin" ? "/admin" : "/staff/orders") : "/staff/login"}>
            <Button className="h-11 min-h-11 px-4">
              <LogIn size={16} />
              Staff
            </Button>
          </Link>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-black/10 bg-white/70 px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-black text-ink">Royal Spice Restaurant</p>
            <p className="mt-1 text-sm text-stone-600">Dine-in table ordering, kitchen display, billing, and reports.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="h-11 min-h-11">
              <ChefHat size={16} />
              Open Menu
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

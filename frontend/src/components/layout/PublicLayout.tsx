import { Link, NavLink, Outlet } from "react-router-dom";
import { ChefHat, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/bar", label: "Bar" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

function staffHome(role?: string) {
  if (role === "kitchen") return "/kitchen";
  if (role === "bar") return "/bar-service";
  if (role === "admin") return "/admin";
  return "/staff/orders";
}

export function PublicLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-restaurant-radial">
      <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/royal-spice-brand.svg" alt="Shiva Royal Spice Restaurant and Bar" className="h-12 w-auto max-w-[180px] object-contain sm:h-14 sm:max-w-[220px]" />
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
          <Link to={user ? staffHome(user.role) : "/staff/login"}>
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
            <p className="text-xl font-black text-ink">Royal Spice Restaurant and Bar</p>
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

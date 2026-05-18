import { NavLink } from "react-router-dom";
import { BarChart3, ChefHat, ClipboardList, LogOut, Settings, Table2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/staff/orders", label: "Orders", icon: ClipboardList, roles: ["admin", "waiter", "cashier"] },
  { href: "/kitchen", label: "Kitchen", icon: ChefHat, roles: ["admin", "kitchen"] },
  { href: "/admin", label: "Admin", icon: Settings, roles: ["admin"] }
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-forest-900 p-5 text-white lg:block xl:w-72">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-300 text-forest-900">
          <Utensils size={22} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-black">Royal Spice</p>
          <p className="truncate text-xs font-bold text-gold-300">Table Ordering System</p>
        </div>
      </div>
      <div className="mt-8 rounded-[8px] bg-white/10 p-4">
        <p className="truncate font-black">{user?.name}</p>
        <p className="mt-1 text-xs font-bold uppercase text-gold-300">{user?.role}</p>
      </div>
      <nav className="mt-6 space-y-2">
        {links
          .filter((link) => user && link.roles.includes(user.role))
          .map(({ href, label, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-black transition ${
                  isActive ? "bg-gold-300 text-forest-900" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
      </nav>
      <div className="absolute bottom-5 left-5 right-5 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-[8px] bg-white/10 p-3">
            <Table2 size={16} />
            <p className="mt-2 font-black">Live tables</p>
          </div>
          <div className="rounded-[8px] bg-white/10 p-3">
            <BarChart3 size={16} />
            <p className="mt-2 font-black">Sales reports</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={logout}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </aside>
  );
}

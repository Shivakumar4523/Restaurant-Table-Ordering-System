import { Link, NavLink } from "react-router-dom";
import { BarChart3, ChefHat, ClipboardList, LogOut, ReceiptText, Settings, Table2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/api";

type SidebarLink = {
  href: string;
  label: string;
  cashierLabel?: string;
  icon: typeof ClipboardList;
  cashierIcon?: typeof ClipboardList;
  roles: Role[];
};

const links: SidebarLink[] = [
  { href: "/staff/orders", label: "Orders", cashierLabel: "Billing", icon: ClipboardList, cashierIcon: ReceiptText, roles: ["admin", "waiter", "cashier"] },
  { href: "/kitchen", label: "Kitchen", icon: ChefHat, roles: ["admin", "kitchen"] },
  { href: "/admin", label: "Admin", icon: Settings, roles: ["admin"] }
];

const quickLinks: Array<{ href: string; label: string; icon: typeof Table2; roles: Role[] }> = [
  { href: "/staff/orders", label: "Live tables", icon: Table2, roles: ["admin", "waiter"] },
  { href: "/staff/orders", label: "Unpaid bills", icon: ReceiptText, roles: ["cashier"] },
  { href: "/admin?tab=overview", label: "Sales reports", icon: BarChart3, roles: ["admin"] }
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const visibleQuickLinks = quickLinks.filter((link) => user && link.roles.includes(user.role));

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/10 bg-forest-900 p-5 text-white lg:block xl:w-72">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-300 text-forest-900">
          <Utensils size={22} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-brand text-xl font-bold italic leading-5 tracking-wide">
            Royal Spice
            <span
              className="ml-2 inline-block -rotate-2 align-super text-[17px] font-normal leading-none text-gold-300 drop-shadow-[0_2px_10px_rgba(246,201,90,0.3)]"
              style={{ fontFamily: '"Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive' }}
            >
              Shiva
            </span>
          </p>
          <p className="truncate font-brand text-sm font-semibold italic leading-5 text-gold-300">Table Ordering System</p>
        </div>
      </div>
      <div className="mt-8 rounded-[8px] bg-white/10 p-4">
        <p className="truncate font-black">{user?.name}</p>
        <p className="mt-1 text-xs font-bold uppercase text-gold-300">{user?.role}</p>
      </div>
      <nav className="mt-6 space-y-2">
        {links
          .filter((link) => user && link.roles.includes(user.role))
          .map((link) => {
            const Icon = user?.role === "cashier" && link.cashierIcon ? link.cashierIcon : link.icon;
            const label = user?.role === "cashier" && link.cashierLabel ? link.cashierLabel : link.label;

            return (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[8px] px-4 py-3 text-sm font-black transition ${
                    isActive ? "bg-gold-300 text-forest-900" : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            );
          })}
      </nav>
      <div className="absolute bottom-5 left-5 right-5 space-y-3">
        {visibleQuickLinks.length ? (
          <div className={`${visibleQuickLinks.length === 1 ? "grid-cols-1" : "grid-cols-2"} grid gap-2 text-xs`}>
            {visibleQuickLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="rounded-[8px] bg-white/10 p-3 text-left transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
              >
                <Icon size={16} />
                <p className="mt-2 font-black">{label}</p>
              </Link>
            ))}
          </div>
        ) : null}
        <Button variant="ghost" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/15" onClick={logout}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </aside>
  );
}

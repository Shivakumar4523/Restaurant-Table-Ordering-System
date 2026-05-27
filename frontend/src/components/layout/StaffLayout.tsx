import { Link, Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

export function StaffLayout() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-cream">
      <Sidebar />
      <div className="flex min-w-0 max-w-full flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/10 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/royal-spice-brand.svg" alt="Shiva Royal Spice Restaurant and Bar" className="h-10 w-auto max-w-[150px] shrink-0 object-contain sm:h-11 sm:max-w-[180px] lg:hidden" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black uppercase text-gold-700">Restaurant Table Ordering System</p>
              <h1 className="truncate text-lg font-black text-ink">Royal Spice Restaurant and Bar</h1>
            </div>
          </div>
          <div className="ml-3 flex shrink-0 items-center gap-2">
            <span className={`hidden rounded-full px-3 py-1 text-xs font-black sm:inline-flex ${connected ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
              {connected ? "Live" : "Offline"}
            </span>
            <Link to="/staff/orders" className="lg:hidden">
              <Button variant="ghost" className="h-10 min-h-10 px-3">
                <Menu size={17} />
              </Button>
            </Link>
            <Button variant="ghost" className="h-10 min-h-10 px-4" onClick={logout}>
              {user?.role}
            </Button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

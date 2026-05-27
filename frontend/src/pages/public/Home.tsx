import { Link } from "react-router-dom";
import { ArrowRight, ChefHat, Clock, ReceiptText, TabletSmartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";

export function Home() {
  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <img src="/royal-spice-brand.svg" alt="Shiva Royal Spice Restaurant and Bar" className="w-full max-w-xl object-contain" />
          <p className="mt-8 text-sm font-black uppercase tracking-[0.22em] text-gold-700">Royal Spice Restaurant and Bar</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-ink sm:text-6xl">
            Restaurant Table Ordering System
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-700">
            A modern dine-in workflow for waiters, kitchen staff, cashiers, and admins with live table orders, GST billing, and sales reports.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/staff/login">
              <Button>
                Staff Login
                <ArrowRight size={17} />
              </Button>
            </Link>
            <Link to="/menu">
              <Button variant="secondary">View Menu</Button>
            </Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <StatCard label="Live orders" value="Socket.IO" />
            <StatCard label="GST billing" value="5%" />
            <StatCard label="Table colors" value="4 states" />
          </div>
        </div>
        <div className="rounded-[8px] bg-forest-900 p-5 text-white shadow-glow">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: TabletSmartphone, title: "Waiter Ordering", text: "Pick a table, add dishes, and send notes to kitchen." },
              { icon: ChefHat, title: "Kitchen Display", text: "Incoming orders update instantly with clear statuses." },
              { icon: ReceiptText, title: "Billing", text: "Generate GST bills and mark payments by cash, card, or UPI." },
              { icon: Clock, title: "Order History", text: "Track active orders and report completed sales." }
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[8px] bg-white/10 p-5">
                <Icon className="text-gold-300" size={28} />
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/72">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

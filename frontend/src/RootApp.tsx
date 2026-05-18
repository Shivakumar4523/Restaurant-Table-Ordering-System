import { Navigate, Route, Routes } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { RoleRoute } from "@/routes/RoleRoute";
import { StaffLogin } from "@/pages/auth/StaffLogin";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { KitchenDashboard } from "@/pages/kitchen/KitchenDashboard";
import { Orders } from "@/pages/staff/Orders";
import { About } from "@/pages/public/About";
import { Contact } from "@/pages/public/Contact";
import { Home } from "@/pages/public/Home";
import { Menu } from "@/pages/public/Menu";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/staff/login" element={<StaffLogin />} />

      <Route element={<StaffLayout />}>
        <Route element={<RoleRoute roles={["admin", "waiter", "cashier"]} />}>
          <Route path="/staff/orders" element={<Orders />} />
        </Route>
        <Route element={<RoleRoute roles={["admin", "kitchen"]} />}>
          <Route path="/kitchen" element={<KitchenDashboard />} />
        </Route>
        <Route element={<RoleRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

const demoLogins = [
  "owner@royalspice.test / owner16655",
  "waiter@royalspice.test / waiter6655",
  "chef@royalspice.test / chef6655",
  "cashier@royalspice.test / cash6655"
];

export function StaffLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === "kitchen" ? "/kitchen" : user.role === "admin" ? "/admin" : "/staff/orders"} replace />;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError("");

    try {
      await login({
        email: String(form.get("email")),
        password: String(form.get("password"))
      });
      navigate((location.state as { from?: string } | null)?.from || "/staff/orders", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-restaurant-radial px-4 py-10">
      <form onSubmit={onSubmit} className="glass w-full max-w-md rounded-[8px] p-6 shadow-gold">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-forest-700 text-gold-300">
          <LockKeyhole size={22} />
        </div>
        <h1 className="mt-5 text-3xl font-black text-ink">Staff Login</h1>
        <p className="mt-2 text-sm text-stone-600">Access waiter ordering, kitchen display, billing, and admin tools.</p>
        <div className="mt-6 grid gap-3">
          <Input name="email" type="email" required placeholder="Email" defaultValue="waiter@royalspice.test" />
          <Input name="password" type="password" required placeholder="Password" defaultValue="waiter6655" />
        </div>
        {error ? <p className="mt-4 rounded-[8px] bg-red-50 p-3 text-sm font-black text-red-700">{error}</p> : null}
        <Button className="mt-5 w-full" disabled={loading}>{loading ? "Signing in..." : "Login"}</Button>
        <div className="mt-5 rounded-[8px] bg-forest-50 p-4">
          <p className="text-xs font-black uppercase text-forest-700">Demo accounts</p>
          <div className="mt-2 space-y-1 text-xs font-bold text-stone-600">
            {demoLogins.map((loginText) => <p key={loginText}>{loginText}</p>)}
          </div>
        </div>
      </form>
    </main>
  );
}

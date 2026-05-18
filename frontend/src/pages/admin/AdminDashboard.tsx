import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { TableStatusPill } from "@/components/ui/TableStatusPill";
import {
  deleteMenuItem,
  getCategories,
  getEmployees,
  getMenuItems,
  getSalesReport,
  getTables,
  saveCategory,
  saveEmployee,
  saveMenuItem,
  saveTable,
  type Category,
  type MenuItem,
  type RestaurantTable,
  type SalesReport,
  type User
} from "@/lib/api";
import { formatMoney } from "@/lib/constants";

type Tab = "overview" | "menu" | "categories" | "tables" | "employees";

const tabs: Tab[] = ["overview", "menu", "categories", "tables", "employees"];

export function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const [categoryData, menuData, tableData, employeeData, reportData] = await Promise.all([
      getCategories(),
      getMenuItems({ available: false }),
      getTables(),
      getEmployees(),
      getSalesReport().catch(() => null)
    ]);
    setCategories(categoryData);
    setItems(menuData);
    setTables(tableData);
    setEmployees(employeeData);
    setReport(reportData);
  }

  useEffect(() => {
    load();
  }, []);

  const categoryOptions = useMemo(() => categories.map((category) => category.name), [categories]);

  async function onMenuSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await saveMenuItem({
      name: String(form.get("name")),
      description: String(form.get("description")),
      categoryName: String(form.get("categoryName")),
      price: Number(form.get("price")),
      foodType: String(form.get("foodType")) as "veg" | "non-veg",
      prepTime: Number(form.get("prepTime") || 15),
      isFeatured: form.get("isFeatured") === "on",
      isAvailable: true
    });
    event.currentTarget.reset();
    setMessage("Menu item saved.");
    setItems(await getMenuItems({ available: false }));
  }

  async function onCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await saveCategory({
      name: String(form.get("name")),
      description: String(form.get("description")),
      sortOrder: Number(form.get("sortOrder") || 0)
    });
    event.currentTarget.reset();
    setMessage("Category saved.");
    setCategories(await getCategories());
  }

  async function onTableSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await saveTable({
      number: String(form.get("number")),
      capacity: Number(form.get("capacity")),
      section: String(form.get("section"))
    });
    event.currentTarget.reset();
    setMessage("Table saved.");
    setTables(await getTables());
  }

  async function onEmployeeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await saveEmployee({
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      password: String(form.get("password")),
      role: String(form.get("role")) as User["role"],
      employeeCode: String(form.get("employeeCode")),
      isActive: true
    });
    event.currentTarget.reset();
    setMessage("Employee saved.");
    setEmployees(await getEmployees());
  }

  async function removeMenuItem(id: string) {
    await deleteMenuItem(id);
    setItems(await getMenuItems({ available: false }));
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-gold-700">Admin dashboard</p>
          <h2 className="mt-1 text-3xl font-black text-ink">Manage Royal Spice Restaurant</h2>
        </div>
        <Button variant="ghost" onClick={load}>
          <RefreshCw size={16} />
          Refresh
        </Button>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((item) => (
          <Button key={item} variant={tab === item ? "primary" : "ghost"} className="h-10 min-h-10 capitalize" onClick={() => setTab(item)}>
            {item}
          </Button>
        ))}
      </div>

      {message ? <p className="mt-4 rounded-[8px] bg-gold-100 p-3 text-sm font-black text-ink">{message}</p> : null}

      {tab === "overview" ? (
        <section className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Revenue" value={formatMoney(report?.revenue || 0)} />
            <StatCard label="GST collected" value={formatMoney(report?.gst || 0)} />
            <StatCard label="Paid bills" value={report?.paidBills || 0} />
            <StatCard label="Menu items" value={items.length} />
          </div>
          <div className="glass rounded-[8px] p-5">
            <h3 className="text-xl font-black text-ink">Sales report</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs uppercase text-stone-500">
                    <th className="py-3">Payment</th>
                    <th>Method</th>
                    <th>GST</th>
                    <th>Total</th>
                    <th>Paid at</th>
                  </tr>
                </thead>
                <tbody>
                  {(report?.payments || []).map((payment) => (
                    <tr key={payment._id} className="border-b border-black/5">
                      <td className="py-3 font-black">#{payment._id.slice(-6).toUpperCase()}</td>
                      <td className="uppercase">{payment.method}</td>
                      <td>{formatMoney(payment.gst)}</td>
                      <td className="font-black">{formatMoney(payment.total)}</td>
                      <td>{new Date(payment.paidAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!report?.payments?.length ? <p className="py-8 text-center font-bold text-stone-600">No paid bills yet.</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {tab === "menu" ? (
        <section className="mt-6 grid gap-5 xl:grid-cols-[380px_1fr]">
          <form onSubmit={onMenuSubmit} className="glass h-fit rounded-[8px] p-5">
            <h3 className="text-xl font-black text-ink">Add menu item</h3>
            <div className="mt-4 grid gap-3">
              <Input name="name" placeholder="Dish name" required />
              <textarea name="description" className="min-h-24 rounded-[8px] border border-black/10 bg-white p-3 text-sm font-semibold outline-none" placeholder="Description" required />
              <select name="categoryName" className="h-11 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold">
                {categoryOptions.map((category) => <option key={category}>{category}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input name="price" type="number" placeholder="Price" required />
                <Input name="prepTime" type="number" placeholder="Prep min" defaultValue={15} />
              </div>
              <select name="foodType" className="h-11 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold">
                <option value="veg">Veg</option>
                <option value="non-veg">Non-veg</option>
              </select>
              <label className="flex items-center gap-2 text-sm font-black"><input type="checkbox" name="isFeatured" /> Featured</label>
              <Button><Plus size={16} /> Save item</Button>
            </div>
          </form>
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <div key={item._id} className="rounded-[8px] border border-black/10 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-gold-700">{item.categoryName}</p>
                    <h4 className="mt-1 font-black text-ink">{item.name}</h4>
                    <p className="mt-1 text-sm text-stone-600">{item.foodType} | {formatMoney(item.price)}</p>
                  </div>
                  <Button variant="danger" className="h-10 min-h-10 px-3" onClick={() => removeMenuItem(item._id)}><Trash2 size={15} /></Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "categories" ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
          <form onSubmit={onCategorySubmit} className="glass h-fit rounded-[8px] p-5">
            <h3 className="text-xl font-black text-ink">Add category</h3>
            <div className="mt-4 grid gap-3">
              <Input name="name" placeholder="Category name" required />
              <Input name="description" placeholder="Description" />
              <Input name="sortOrder" type="number" placeholder="Sort order" />
              <Button>Save category</Button>
            </div>
          </form>
          <div className="grid gap-3 md:grid-cols-2">
            {categories.map((category) => (
              <div key={category._id} className="rounded-[8px] border border-black/10 bg-white p-4">
                <p className="font-black text-ink">{category.name}</p>
                <p className="mt-1 text-sm text-stone-600">{category.description}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "tables" ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
          <form onSubmit={onTableSubmit} className="glass h-fit rounded-[8px] p-5">
            <h3 className="text-xl font-black text-ink">Add table</h3>
            <div className="mt-4 grid gap-3">
              <Input name="number" placeholder="Table number" required />
              <Input name="capacity" type="number" placeholder="Capacity" required />
              <Input name="section" placeholder="Section" defaultValue="Main Dining" />
              <Button>Save table</Button>
            </div>
          </form>
          <div className="grid gap-3 md:grid-cols-3">
            {tables.map((table) => (
              <div key={table._id} className="rounded-[8px] border border-black/10 bg-white p-4">
                <p className="text-xl font-black text-ink">{table.number}</p>
                <p className="mt-1 text-sm text-stone-600">{table.section} | {table.capacity} seats</p>
                <div className="mt-3"><TableStatusPill status={table.status} /></div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "employees" ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
          <form onSubmit={onEmployeeSubmit} className="glass h-fit rounded-[8px] p-5">
            <h3 className="text-xl font-black text-ink">Add employee</h3>
            <div className="mt-4 grid gap-3">
              <Input name="name" placeholder="Name" required />
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="phone" placeholder="Phone" />
              <Input name="employeeCode" placeholder="Employee code" />
              <Input name="password" type="password" placeholder="Password" defaultValue="staff123" />
              <select name="role" className="h-11 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold">
                <option value="waiter">Waiter</option>
                <option value="kitchen">Kitchen Staff</option>
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
              </select>
              <Button>Save employee</Button>
            </div>
          </form>
          <div className="grid gap-3 md:grid-cols-2">
            {employees.map((employee) => (
              <div key={employee.id || employee.email} className="rounded-[8px] border border-black/10 bg-white p-4">
                <p className="font-black text-ink">{employee.name}</p>
                <p className="mt-1 text-sm text-stone-600">{employee.email}</p>
                <p className="mt-2 inline-flex rounded-full bg-forest-50 px-3 py-1 text-xs font-black uppercase text-forest-700">{employee.role}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

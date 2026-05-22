import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { TableStatusPill } from "@/components/ui/TableStatusPill";
import { useSocket } from "@/context/SocketContext";
import {
  deleteCoupon,
  deleteMenuItem,
  deleteEmployee,
  deleteTable,
  getCategories,
  getCoupons,
  getEmployees,
  getMenuItems,
  getSalesReport,
  getTables,
  saveCategory,
  saveCoupon,
  saveEmployee,
  saveMenuItem,
  saveTable,
  type Category,
  type Coupon,
  type MenuItem,
  type RestaurantTable,
  type SalesReport,
  type User
} from "@/lib/api";
import { formatMoney } from "@/lib/constants";

type Tab = "overview" | "menu" | "categories" | "offers" | "tables" | "employees";

const tabs: Tab[] = ["overview", "menu", "categories", "offers", "tables", "employees"];

function upsertById<T extends { _id: string }>(records: T[], nextRecord: T) {
  return records.some((record) => record._id === nextRecord._id)
    ? records.map((record) => (record._id === nextRecord._id ? nextRecord : record))
    : [nextRecord, ...records];
}

function removeById<T extends { _id: string }>(records: T[], id: string) {
  return records.filter((record) => record._id !== id);
}

function sortMenuItems(records: MenuItem[]) {
  return [...records].sort((a, b) => {
    if (Boolean(a.isFeatured) !== Boolean(b.isFeatured)) return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
    return a.categoryName.localeCompare(b.categoryName) || a.name.localeCompare(b.name);
  });
}

function sortCategories(records: Category[]) {
  return [...records].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || a.name.localeCompare(b.name));
}

function sortCoupons(records: Coupon[]) {
  return [...records].sort((a, b) => Number(b.active) - Number(a.active) || Number(a.minOrder || 0) - Number(b.minOrder || 0) || a.code.localeCompare(b.code));
}

function sortTables(records: RestaurantTable[]) {
  return [...records].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
}

function userId(user: User) {
  return user.id || user._id || user.email;
}

function upsertEmployee(records: User[], nextRecord: User) {
  const nextId = userId(nextRecord);
  const nextRecords = records.some((record) => userId(record) === nextId)
    ? records.map((record) => (userId(record) === nextId ? nextRecord : record))
    : [nextRecord, ...records];

  return nextRecords.sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
}

function parseTab(value: string | null): Tab {
  return tabs.includes(value as Tab) ? (value as Tab) : "overview";
}

export function AdminDashboard() {
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => parseTab(searchParams.get("tab")));
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingMenuItem, setSavingMenuItem] = useState(false);
  const [offerType, setOfferType] = useState<Coupon["type"]>("flat");
  const [savingOffer, setSavingOffer] = useState(false);

  async function load() {
    setLoading(true);
    setMessage("");

    try {
      const [categoryData, menuData, couponData, tableData, employeeData, reportData] = await Promise.all([
        getCategories(),
        getMenuItems(),
        getCoupons(),
        getTables(),
        getEmployees(),
        getSalesReport().catch(() => null)
      ]);
      setCategories(categoryData);
      setItems(menuData);
      setCoupons(couponData);
      setTables(tableData);
      setEmployees(employeeData);
      setReport(reportData);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to refresh dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setTab(parseTab(searchParams.get("tab")));
  }, [searchParams]);

  useEffect(() => {
    if (!socket) return;

    const syncMenuItem = (item: MenuItem) => {
      setItems((current) => (item.isAvailable === false ? removeById(current, item._id) : sortMenuItems(upsertById(current, item))));
    };

    socket.on("menu-item:updated", syncMenuItem);

    return () => {
      socket.off("menu-item:updated", syncMenuItem);
    };
  }, [socket]);

  const categoryOptions = useMemo(() => categories.map((category) => category.name), [categories]);

  function selectTab(nextTab: Tab) {
    setTab(nextTab);
    setSearchParams(nextTab === "overview" ? {} : { tab: nextTab }, { replace: true });
  }

  async function onMenuSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingMenuItem) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const isEditing = Boolean(editingMenuItem);
    const previousItems = items;

    const payload = {
      name: String(form.get("name")),
      description: String(form.get("description")),
      categoryName: String(form.get("categoryName")),
      price: Number(form.get("price")),
      foodType: String(form.get("foodType")) as "veg" | "non-veg",
      prepTime: Number(form.get("prepTime") || 15),
      isFeatured: form.get("isFeatured") === "on",
      isAvailable: true
    };

    if (editingMenuItem) {
      setItems((current) => sortMenuItems(upsertById(current, { ...editingMenuItem, ...payload })));
    }

    setSavingMenuItem(true);
    try {
      const savedItem = await saveMenuItem(payload, editingMenuItem?._id);

      formElement.reset();
      setEditingMenuItem(null);
      setMessage(isEditing ? "Menu item updated." : "Menu item saved.");
      setItems((current) => sortMenuItems(upsertById(current, savedItem)));
    } catch (error) {
      if (editingMenuItem) setItems(previousItems);
      setMessage(error instanceof Error ? error.message : "Unable to save menu item.");
    } finally {
      setSavingMenuItem(false);
    }
  }

  async function onCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const savedCategory = await saveCategory({
      name: String(form.get("name")),
      description: String(form.get("description")),
      sortOrder: Number(form.get("sortOrder") || 0)
    });
    formElement.reset();
    setMessage("Category saved.");
    setCategories((current) => sortCategories(upsertById(current, savedCategory)));
  }

  async function onCouponSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingOffer) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const expiresAt = String(form.get("expiresAt") || "");
    const type = String(form.get("type")) as Coupon["type"];
    const value = Number(form.get("value"));

    if (type === "percent" && value > 100) {
      setMessage("Percent offers must be 100 or less. Choose Flat amount off for rupee discounts.");
      return;
    }

    setSavingOffer(true);

    try {
      const savedCoupon = await saveCoupon({
        code: String(form.get("code")),
        type,
        value,
        minOrder: Number(form.get("minOrder") || 0),
        active: form.get("active") === "on",
        expiresAt: expiresAt || undefined
      });
      formElement.reset();
      setOfferType("flat");
      setMessage(`Offer ${savedCoupon.code} saved.`);
      setCoupons((current) => sortCoupons(upsertById(current, savedCoupon)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save offer.");
    } finally {
      setSavingOffer(false);
    }
  }

  async function onTableSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const savedTable = await saveTable({
      number: String(form.get("number")),
      capacity: Number(form.get("capacity")),
      section: String(form.get("section"))
    });
    formElement.reset();
    setMessage("Table saved.");
    setTables((current) => sortTables(upsertById(current, savedTable)));
  }

  async function onEmployeeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const savedEmployee = await saveEmployee({
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      password: String(form.get("password")),
      role: String(form.get("role")) as User["role"],
      employeeCode: String(form.get("employeeCode")),
      isActive: true
    });
    formElement.reset();
    setMessage("Employee saved.");
    setEmployees((current) => upsertEmployee(current, savedEmployee));
  }

  async function removeMenuItem(id: string) {
    await deleteMenuItem(id);
    if (editingMenuItem?._id === id) setEditingMenuItem(null);
    setItems((current) => removeById(current, id));
  }

  async function toggleCoupon(coupon: Coupon) {
    const savedCoupon = await saveCoupon({ active: !coupon.active }, coupon._id);
    setMessage(`${coupon.code} ${coupon.active ? "deactivated" : "activated"}.`);
    setCoupons((current) => sortCoupons(upsertById(current, savedCoupon)));
  }

  async function removeCoupon(coupon: Coupon) {
    if (!window.confirm(`Remove offer ${coupon.code}?`)) return;

    await deleteCoupon(coupon._id);
    setMessage(`${coupon.code} removed.`);
    setCoupons((current) => removeById(current, coupon._id));
  }

  async function removeTable(table: RestaurantTable) {
    const label = `Table ${table.number}`;
    if (!window.confirm(`Remove ${label}?`)) return;

    await deleteTable(table._id);
    setMessage(`${label} removed.`);
    setTables((current) => removeById(current, table._id));
  }

  async function removeEmployee(employee: User) {
    const employeeId = employee.id || employee._id;
    if (!employeeId) {
      setMessage("Unable to remove employee: missing employee id.");
      return;
    }

    if (!window.confirm(`Remove ${employee.name}?`)) return;

    await deleteEmployee(employeeId);
    setMessage(`${employee.name} removed.`);
    setEmployees((current) => current.filter((record) => userId(record) !== employeeId));
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-gold-700">Admin dashboard</p>
          <h2 className="mt-1 text-3xl font-black text-ink">Manage Royal Spice Restaurant</h2>
        </div>
        <Button variant="ghost" onClick={load} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : undefined} size={16} />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((item) => (
          <Button key={item} variant={tab === item ? "primary" : "ghost"} className="h-10 min-h-10 capitalize" onClick={() => selectTab(item)}>
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
          <form key={editingMenuItem?._id || "new-menu-item"} onSubmit={onMenuSubmit} className="glass h-fit rounded-[8px] p-5">
            <h3 className="text-xl font-black text-ink">{editingMenuItem ? "Edit menu item" : "Add menu item"}</h3>
            <div className="mt-4 grid gap-3">
              <Input name="name" placeholder="Dish name" defaultValue={editingMenuItem?.name || ""} required />
              <textarea
                name="description"
                className="min-h-24 rounded-[8px] border border-black/10 bg-white p-3 text-sm font-semibold outline-none"
                placeholder="Description"
                defaultValue={editingMenuItem?.description || ""}
                required
              />
              <select name="categoryName" defaultValue={editingMenuItem?.categoryName || categoryOptions[0]} className="h-11 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold">
                {editingMenuItem?.categoryName && !categoryOptions.includes(editingMenuItem.categoryName) ? <option>{editingMenuItem.categoryName}</option> : null}
                {categoryOptions.map((category) => <option key={category}>{category}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input name="price" type="number" min={0} placeholder="Price" defaultValue={editingMenuItem?.price ?? ""} required />
                <Input name="prepTime" type="number" min={1} placeholder="Prep min" defaultValue={editingMenuItem?.prepTime || 15} />
              </div>
              <select name="foodType" defaultValue={editingMenuItem?.foodType || "veg"} className="h-11 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold">
                <option value="veg">Veg</option>
                <option value="non-veg">Non-veg</option>
              </select>
              <label className="flex items-center gap-2 text-sm font-black"><input type="checkbox" name="isFeatured" defaultChecked={Boolean(editingMenuItem?.isFeatured)} /> Featured</label>
              <Button disabled={savingMenuItem}>
                {editingMenuItem ? <Pencil size={16} /> : <Plus size={16} />}
                {savingMenuItem ? (editingMenuItem ? "Updating..." : "Saving...") : editingMenuItem ? "Update item" : "Save item"}
              </Button>
              {editingMenuItem ? (
                <Button type="button" variant="ghost" onClick={() => setEditingMenuItem(null)}>Cancel edit</Button>
              ) : null}
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
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-10 min-h-10 px-3"
                      onClick={() => setEditingMenuItem(item)}
                      aria-label={`Edit ${item.name}`}
                      title={`Edit ${item.name}`}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button type="button" variant="danger" className="h-10 min-h-10 px-3" onClick={() => removeMenuItem(item._id)}><Trash2 size={15} /></Button>
                  </div>
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

      {tab === "offers" ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
          <form onSubmit={onCouponSubmit} className="glass h-fit rounded-[8px] p-5">
            <h3 className="text-xl font-black text-ink">Add offer</h3>
            <div className="mt-4 grid gap-3">
              <Input name="code" placeholder="Coupon code" required />
              <select
                name="type"
                value={offerType}
                onChange={(event) => setOfferType(event.target.value as Coupon["type"])}
                className="h-11 rounded-[8px] border border-black/10 bg-white px-3 text-sm font-semibold"
              >
                <option value="flat">Flat amount off</option>
                <option value="percent">Percent off</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <Input name="value" type="number" min={1} placeholder={offerType === "percent" ? "Percent" : "Amount"} required />
                <Input name="minOrder" type="number" min={0} placeholder="Min order" defaultValue={0} />
              </div>
              <p className="text-xs font-bold text-stone-500">
                {offerType === "percent" ? "Percent offers can be 1 to 100." : "Use this for rupee discounts like 599 off."}
              </p>
              <Input name="expiresAt" type="date" placeholder="Expiry date" />
              <label className="flex items-center gap-2 text-sm font-black"><input type="checkbox" name="active" defaultChecked /> Active</label>
              <Button disabled={savingOffer}>{savingOffer ? "Saving offer..." : "Save offer"}</Button>
            </div>
          </form>
          <div className="grid gap-3 md:grid-cols-2">
            {coupons.map((coupon) => (
              <div key={coupon._id} className="rounded-[8px] border border-black/10 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-gold-700">{coupon.active ? "Active offer" : "Inactive offer"}</p>
                    <p className="mt-1 text-xl font-black text-ink">{coupon.code}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {coupon.type === "percent" ? `${coupon.value}% off` : `${formatMoney(coupon.value)} off`} over {formatMoney(coupon.minOrder)}
                    </p>
                    {coupon.expiresAt ? <p className="mt-1 text-xs font-bold text-stone-500">Expires {new Date(coupon.expiresAt).toLocaleDateString()}</p> : null}
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    className="h-10 min-h-10 px-3"
                    onClick={() => removeCoupon(coupon)}
                    aria-label={`Remove offer ${coupon.code}`}
                    title={`Remove offer ${coupon.code}`}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
                <Button type="button" variant="ghost" className="mt-4 h-10 min-h-10 px-4" onClick={() => toggleCoupon(coupon)}>
                  {coupon.active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ))}
            {!coupons.length ? <p className="rounded-[8px] border border-black/10 bg-white p-5 text-sm font-bold text-stone-600">No offers yet.</p> : null}
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
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-black text-ink">{table.number}</p>
                    <p className="mt-1 text-sm text-stone-600">{table.section} | {table.capacity} seats</p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    className="h-10 min-h-10 px-3"
                    onClick={() => removeTable(table)}
                    aria-label={`Remove table ${table.number}`}
                    title={`Remove table ${table.number}`}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
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
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-ink">{employee.name}</p>
                    <p className="mt-1 text-sm text-stone-600">{employee.email}</p>
                    <p className="mt-2 inline-flex rounded-full bg-forest-50 px-3 py-1 text-xs font-black uppercase text-forest-700">{employee.role}</p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    className="h-10 min-h-10 px-3"
                    onClick={() => removeEmployee(employee)}
                    aria-label={`Remove employee ${employee.name}`}
                    title={`Remove employee ${employee.name}`}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

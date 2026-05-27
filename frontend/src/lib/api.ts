import axios from "axios";

export type Role = "admin" | "waiter" | "kitchen" | "bar" | "cashier" | "user";

export type User = {
  _id?: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  employeeCode?: string;
  isActive?: boolean;
};

export type Category = {
  _id: string;
  name: string;
  description?: string;
  sortOrder?: number;
};

export type Coupon = {
  _id: string;
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrder: number;
  active: boolean;
  expiresAt?: string;
};

export type MenuItem = {
  _id: string;
  name: string;
  description: string;
  category: string | Category;
  categoryName: string;
  price: number;
  image?: string;
  foodType: "veg" | "non-veg";
  tags?: string[];
  prepTime?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
};

export type BarPegSize = "smallPeg" | "largePeg" | "bottle";

export type BarItem = {
  _id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  prices: {
    smallPeg: number;
    largePeg: number;
    bottle: number;
  };
  stock: number;
  preparationTime: number;
  alcoholType: string;
  brand: string;
  mlSize: number;
  isAvailable: boolean;
  isAlcoholic: boolean;
  gstPercentage: number;
  createdAt: string;
  updatedAt?: string;
};

export type BarItemsPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type BarItemsResponse = {
  barItems: BarItem[];
  categories: string[];
  pagination: BarItemsPagination;
};

export type RestaurantTable = {
  _id: string;
  number: string;
  capacity: number;
  section: string;
  status: "empty" | "ordered" | "busy" | "billing";
  currentOrder?: string;
};

export type OrderItem = {
  menuItem?: string;
  barItem?: string;
  itemType?: "food" | "menuItem" | "barItem";
  name: string;
  price: number;
  quantity: number;
  pegSize?: BarPegSize;
  gstPercentage?: number;
  stationStatus?: "pending" | "preparing" | "ready" | "served";
  note?: string;
};

export type Order = {
  _id: string;
  table?: RestaurantTable;
  tableNumber: string;
  waiter?: User;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  gst: number;
  gstRate: number;
  total: number;
  status: "pending" | "preparing" | "ready" | "served" | "billing" | "cancelled" | "merged";
  kitchenStatus?: "pending" | "preparing" | "ready" | "served";
  barStatus?: "pending" | "preparing" | "ready" | "served";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  customerNotes?: string;
  createdAt: string;
  billNumber?: string;
};

export type Bill = {
  order: Order;
  subtotal: number;
  discount: number;
  gst: number;
  gstRate: number;
  total: number;
  billNumber: string;
};

export type SalesReport = {
  revenue: number;
  gst: number;
  paidBills: number;
  orderCount: number;
  averageBill: number;
  payments: Array<{ _id: string; total: number; gst: number; method: string; paidAt: string }>;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("rain-tree-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrapError(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return new Error(error.response?.data?.message || error.message);
  }
  return error instanceof Error ? error : new Error("Request failed");
}

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(unwrapError(error))
);

export async function login(payload: { email: string; password: string }) {
  try {
    const { data } = await api.post<{ token: string; user: User }>("/auth/login", payload);
    return data;
  } catch (error) {
    throw unwrapError(error);
  }
}

export async function getMe() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function getMenuItems(params?: { q?: string; category?: string; available?: boolean }) {
  const { data } = await api.get<{ menuItems: MenuItem[] }>("/menu-items", { params });
  return data.menuItems;
}

export async function getBarItems(params?: {
  q?: string;
  category?: string;
  available?: boolean;
  stockStatus?: "in" | "low" | "out";
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get<BarItemsResponse>("/bar-items", { params });
  return data;
}

export async function getBarCategories() {
  const { data } = await api.get<{ categories: string[] }>("/bar-items/categories");
  return data.categories;
}

export async function getCategories() {
  const { data } = await api.get<{ categories: Category[] }>("/categories");
  return data.categories;
}

export async function getActiveCoupons() {
  const { data } = await api.get<{ coupons: Coupon[] }>("/coupons");
  return data.coupons;
}

export async function getCoupons() {
  const { data } = await api.get<{ coupons: Coupon[] }>("/coupons/admin");
  return data.coupons;
}

export async function getTables() {
  const { data } = await api.get<{ tables: RestaurantTable[] }>("/tables");
  return data.tables;
}

export async function getActiveOrders() {
  const { data } = await api.get<{ orders: Order[] }>("/orders/active");
  return data.orders;
}

export async function submitTableOrder(payload: {
  tableId: string;
  items: Array<{ menuItem?: string; barItem?: string; quantity: number; pegSize?: BarPegSize; note?: string }>;
  customerNotes?: string;
}) {
  const { data } = await api.post<{ order: Order }>("/orders/table", payload);
  return data.order;
}

export async function updateOrderStatus(id: string, status: string, station?: "kitchen" | "bar") {
  const { data } = await api.patch<{ order: Order }>(`/orders/${id}/table-status`, { status, station });
  return data.order;
}

export async function markBilling(id: string) {
  const { data } = await api.patch<{ order: Order }>(`/orders/${id}/billing`);
  return data.order;
}

export async function getBill(id: string) {
  const { data } = await api.get<{ bill: Bill }>(`/orders/${id}/bill`);
  return data.bill;
}

export async function recordPayment(orderId: string, method: "cash" | "card" | "upi") {
  const { data } = await api.post<{ order: Order }>(`/orders/payments`, { orderId, method });
  return data.order;
}

export async function getSalesReport() {
  const { data } = await api.get<{ report: SalesReport }>("/reports/sales");
  return data.report;
}

export async function saveMenuItem(payload: Partial<MenuItem>, id?: string) {
  const { data } = id
    ? await api.patch<{ menuItem: MenuItem }>(`/menu-items/${id}`, payload)
    : await api.post<{ menuItem: MenuItem }>("/menu-items", payload);
  return data.menuItem;
}

export async function deleteMenuItem(id: string) {
  await api.delete(`/menu-items/${id}`);
}

export async function saveBarItemForm(payload: FormData, id?: string) {
  const { data } = id
    ? await api.put<{ barItem: BarItem }>(`/bar-items/${id}`, payload)
    : await api.post<{ barItem: BarItem }>("/bar-items", payload);
  return data.barItem;
}

export async function deleteBarItem(id: string) {
  await api.delete(`/bar-items/${id}`);
}

export function resolveAssetUrl(path?: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const baseUrl = String(api.defaults.baseURL || "").replace(/\/api\/?$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function saveCategory(payload: Partial<Category>, id?: string) {
  const { data } = id
    ? await api.patch<{ category: Category }>(`/categories/${id}`, payload)
    : await api.post<{ category: Category }>("/categories", payload);
  return data.category;
}

export async function saveCoupon(payload: Partial<Coupon>, id?: string) {
  const { data } = id ? await api.patch<{ coupon: Coupon }>(`/coupons/${id}`, payload) : await api.post<{ coupon: Coupon }>("/coupons", payload);
  return data.coupon;
}

export async function deleteCoupon(id: string) {
  await api.delete(`/coupons/${id}`);
}

export async function saveTable(payload: Partial<RestaurantTable>, id?: string) {
  const { data } = id ? await api.patch<{ table: RestaurantTable }>(`/tables/${id}`, payload) : await api.post<{ table: RestaurantTable }>("/tables", payload);
  return data.table;
}

export async function deleteTable(id: string) {
  await api.delete(`/tables/${id}`);
}

export async function getEmployees() {
  const { data } = await api.get<{ employees: User[] }>("/employees");
  return data.employees;
}

export async function saveEmployee(payload: Partial<User> & { password?: string }, id?: string) {
  const { data } = id ? await api.patch<{ employee: User }>(`/employees/${id}`, payload) : await api.post<{ employee: User }>("/employees", payload);
  return data.employee;
}

export async function deleteEmployee(id: string) {
  await api.delete(`/employees/${id}`);
}

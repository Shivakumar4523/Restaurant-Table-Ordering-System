import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { sampleFoods } from "@/utils/sample-data";
import type { Address, Food, Order, User } from "@/utils/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type ApiOptions = Omit<AxiosRequestConfig, "url" | "baseURL"> & {
  token?: string | null;
  body?: BodyInit | null;
};

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: "INR";
  receipt?: string;
};

type Reservation = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  status: "requested" | "confirmed" | "cancelled" | "completed";
};

export type AdminAnalytics = {
  summary: {
    orders: number;
    foods: number;
    reservations: number;
    revenue: number;
  };
  statusBreakdown: { _id: string; count: number }[];
  recentOrders: Order[];
};

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined)
  };

  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";

  let data: unknown = options.body;
  if (typeof options.body === "string") {
    data = JSON.parse(options.body);
  }

  try {
    const response = await axios.request<T>({
      baseURL: API_URL,
      url: path,
      method: options.method || "GET",
      headers,
      data,
      params: options.params,
      withCredentials: false
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(axiosError.response?.data?.message || axiosError.message || "Request failed");
  }
}

export async function getFoods(params?: { category?: string; q?: string; featured?: boolean }) {
  const search = new URLSearchParams();

  if (params?.category && params.category !== "All") search.set("category", params.category);
  if (params?.q) search.set("q", params.q);
  if (params?.featured) search.set("featured", "true");

  try {
    const data = await request<{ foods: Food[] }>(`/foods?${search.toString()}`);
    return data.foods;
  } catch {
    const q = params?.q?.toLowerCase();
    return sampleFoods.filter((food) => {
      const byCategory = !params?.category || params.category === "All" || food.category === params.category;
      const byFeatured = !params?.featured || food.isFeatured;
      const bySearch =
        !q ||
        food.name.toLowerCase().includes(q) ||
        food.description.toLowerCase().includes(q) ||
        food.tags.some((tag) => tag.toLowerCase().includes(q));

      return byCategory && byFeatured && bySearch;
    });
  }
}

export function login(payload: { email: string; password: string }) {
  return request<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function signup(payload: { name: string; email: string; phone?: string; password: string }) {
  return request<{ token: string; user: User }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMe(token: string) {
  return request<{ user: User }>("/auth/me", { token });
}

export function createOrder(payload: {
  items: { food: string; quantity: number }[];
  address: Address;
  guestName?: string;
  guestPhone?: string;
  paymentMethod: "razorpay" | "upi" | "cod";
  couponCode?: string;
  notes?: string;
}, token?: string | null) {
  return request<{ order: Order }>("/orders", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function getOrder(id: string) {
  return request<{ order: Order }>(`/orders/${id}`);
}

export function createRazorpayOrder(orderId: string) {
  return request<{ key: string; razorpayOrder: RazorpayOrder; amount: number }>("/payments/razorpay/create-order", {
    method: "POST",
    body: JSON.stringify({ orderId })
  });
}

export function createReservation(payload: Record<string, string | number>) {
  return request<{ reservation: Reservation }>("/reservations", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMine(token: string) {
  return request<{ orders: Order[] }>("/orders/mine", { token });
}

export function getAdminAnalytics(token: string) {
  return request<AdminAnalytics>("/admin/analytics", { token });
}

export function getAdminOrders(token: string) {
  return request<{ orders: Order[] }>("/orders", { token });
}

export function saveFood(token: string, payload: Partial<Food>) {
  return request<{ food: Food }>("/foods", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function saveFoodForm(token: string, payload: FormData, id?: string) {
  return request<{ food: Food }>(id ? `/foods/${id}` : "/foods", {
    method: id ? "PUT" : "POST",
    token,
    body: payload
  });
}

export function deleteFood(token: string, id: string) {
  return request<{ message: string }>(`/foods/${id}`, {
    method: "DELETE",
    token
  });
}

export function updateOrderStatus(token: string, id: string, status: string) {
  return request<{ order: Order }>(`/orders/${id}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status })
  });
}

export function whatsappOrderLink(summary: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "919999999999";
  return `https://wa.me/${phone}?text=${encodeURIComponent(summary)}`;
}

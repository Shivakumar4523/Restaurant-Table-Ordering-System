export type Category = "Veg" | "Non-Veg" | "Fast Food" | "Drinks" | "Desserts";

export type Food = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: Category;
  price: number;
  rating: number;
  image: string;
  tags: string[];
  isFeatured?: boolean;
  isAvailable?: boolean;
  prepTime?: number;
};

export type CartItem = Food & {
  quantity: number;
};

export type Address = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  language?: "en" | "hi";
  addresses?: Address[];
};

export type Order = {
  _id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  paymentMethod: "razorpay" | "upi" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: "placed" | "confirmed" | "preparing" | "out-for-delivery" | "delivered" | "cancelled";
  tracking: { status: string; message: string; at: string }[];
  createdAt: string;
};

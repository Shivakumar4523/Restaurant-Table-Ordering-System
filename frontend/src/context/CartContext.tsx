"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Food } from "@/utils/types";

type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  couponCode: string;
  couponMessage: string;
  itemCount: number;
  addItem: (food: Food) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => void;
  summaryText: () => string;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("royal-cart");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("royal-cart", JSON.stringify(items));
  }, [items]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discount = useMemo(() => {
    if (couponCode === "ROYAL10" && subtotal >= 499) return Math.round(subtotal * 0.1);
    if (couponCode === "GOLD75" && subtotal >= 699) return 75;
    return 0;
  }, [couponCode, subtotal]);
  const deliveryFee = subtotal === 0 || subtotal >= 999 ? 0 : 49;
  const tax = Math.round((subtotal - discount) * 0.05);
  const total = Math.max(0, subtotal - discount + deliveryFee + tax);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      subtotal,
      discount,
      deliveryFee,
      tax,
      total,
      couponCode,
      couponMessage,
      itemCount,
      addItem: (food: Food) => {
        setItems((current) => {
          const existing = current.find((item) => item._id === food._id);
          if (existing) {
            return current.map((item) => (item._id === food._id ? { ...item, quantity: item.quantity + 1 } : item));
          }

          return [...current, { ...food, quantity: 1 }];
        });
      },
      removeItem: (id: string) => setItems((current) => current.filter((item) => item._id !== id)),
      updateQuantity: (id: string, quantity: number) => {
        setItems((current) =>
          current
            .map((item) => (item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
            .filter((item) => item.quantity > 0)
        );
      },
      clearCart: () => {
        setItems([]);
        setCouponCode("");
        setCouponMessage("");
      },
      applyCoupon: (code: string) => {
        const normalized = code.trim().toUpperCase();
        setCouponCode(normalized);

        if (normalized === "ROYAL10" && subtotal >= 499) {
          setCouponMessage("ROYAL10 applied: 10% off.");
          return;
        }

        if (normalized === "GOLD75" && subtotal >= 699) {
          setCouponMessage("GOLD75 applied: Rs 75 off.");
          return;
        }

        setCouponMessage("Try ROYAL10 over Rs 499 or GOLD75 over Rs 699.");
      },
      summaryText: () =>
        [
          "Royal Spice order:",
          ...items.map((item) => `${item.quantity} x ${item.name}`),
          `Total: Rs ${total}`
        ].join("\n")
    }),
    [couponCode, couponMessage, deliveryFee, discount, itemCount, items, subtotal, tax, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

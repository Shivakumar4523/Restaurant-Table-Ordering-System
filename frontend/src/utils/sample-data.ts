import type { Food } from "./types";

export const categories = ["All", "Veg", "Non-Veg", "Fast Food", "Drinks", "Desserts"] as const;

export const sampleFoods: Food[] = [
  {
    _id: "665000000000000000000001",
    name: "Saffron Paneer Tikka",
    slug: "saffron-paneer-tikka",
    description: "Charred paneer cubes with saffron, hung curd, peppers, and royal spice.",
    category: "Veg",
    price: 329,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80",
    tags: ["Bestseller", "Tandoor"],
    isFeatured: true,
    prepTime: 18
  },
  {
    _id: "665000000000000000000002",
    name: "Butter Chicken Royale",
    slug: "butter-chicken-royale",
    description: "Smoky chicken simmered in a velvety tomato, butter, and fenugreek gravy.",
    category: "Non-Veg",
    price: 459,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80",
    tags: ["Chef Special", "Creamy"],
    isFeatured: true,
    prepTime: 24
  },
  {
    _id: "665000000000000000000003",
    name: "Truffle Aloo Burger",
    slug: "truffle-aloo-burger",
    description: "Crispy aloo patty, cheddar, pickled onion, and truffle-spiced makhani mayo.",
    category: "Fast Food",
    price: 249,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    tags: ["Quick Bite"],
    isFeatured: true,
    prepTime: 16
  },
  {
    _id: "665000000000000000000004",
    name: "Pomegranate Mojito",
    slug: "pomegranate-mojito",
    description: "Pomegranate, mint, lime, soda, and crushed ice with a ruby finish.",
    category: "Drinks",
    price: 179,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
    tags: ["Refreshing"],
    prepTime: 8
  },
  {
    _id: "665000000000000000000005",
    name: "Gulab Jamun Cheesecake",
    slug: "gulab-jamun-cheesecake",
    description: "Creamy cheesecake layered with mini gulab jamun and rose pistachio crumble.",
    category: "Desserts",
    price: 229,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
    tags: ["Signature"],
    isFeatured: true,
    prepTime: 10
  },
  {
    _id: "665000000000000000000006",
    name: "Awadhi Veg Biryani",
    slug: "awadhi-veg-biryani",
    description: "Long grain basmati layered with vegetables, saffron, mint, and crisp onions.",
    category: "Veg",
    price: 349,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=900&q=80",
    tags: ["Aromatic"],
    prepTime: 28
  },
  {
    _id: "665000000000000000000007",
    name: "Lahori Chicken Kebab",
    slug: "lahori-chicken-kebab",
    description: "Juicy skewered chicken finished with lime butter and a smoky spice rub.",
    category: "Non-Veg",
    price: 399,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80",
    tags: ["Grilled"],
    prepTime: 22
  },
  {
    _id: "665000000000000000000008",
    name: "Belgian Chocolate Dome",
    slug: "belgian-chocolate-dome",
    description: "Dark chocolate mousse, hazelnut crunch, and warm cocoa sauce.",
    category: "Desserts",
    price: 279,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
    tags: ["Indulgent"],
    prepTime: 12
  }
];

export const reviews = [
  {
    name: "Aarav Mehta",
    body: "The checkout feels faster than every food app I use, and the biryani was packed beautifully.",
    rating: 5
  },
  {
    name: "Nisha Rao",
    body: "Loved the dark mode and live tracking. The dessert section is dangerous in the best way.",
    rating: 5
  },
  {
    name: "Kabir Sethi",
    body: "Premium restaurant feel with delivery speed. Razorpay and COD both worked cleanly.",
    rating: 4.8
  }
];

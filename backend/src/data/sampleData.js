export const foods = [
  {
    name: "Saffron Paneer Tikka",
    slug: "saffron-paneer-tikka",
    description: "Charred paneer cubes marinated with saffron, hung curd, peppers, and royal spice.",
    category: "Veg",
    price: 329,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80",
    tags: ["Bestseller", "Tandoor"],
    isFeatured: true,
    prepTime: 18
  },
  {
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
    name: "Pomegranate Mojito",
    slug: "pomegranate-mojito",
    description: "Pomegranate, mint, lime, soda, and crushed ice with a ruby finish.",
    category: "Drinks",
    price: 179,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
    tags: ["Refreshing"],
    isFeatured: false,
    prepTime: 8
  },
  {
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
    name: "Awadhi Veg Biryani",
    slug: "awadhi-veg-biryani",
    description: "Long grain basmati layered with seasonal vegetables, saffron, mint, and crisp onions.",
    category: "Veg",
    price: 349,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=900&q=80",
    tags: ["Aromatic"],
    isFeatured: false,
    prepTime: 28
  },
  {
    name: "Lahori Chicken Kebab",
    slug: "lahori-chicken-kebab",
    description: "Juicy skewered chicken finished with lime butter and a smoky spice rub.",
    category: "Non-Veg",
    price: 399,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80",
    tags: ["Grilled"],
    isFeatured: false,
    prepTime: 22
  },
  {
    name: "Belgian Chocolate Dome",
    slug: "belgian-chocolate-dome",
    description: "Dark chocolate mousse, hazelnut crunch, and warm cocoa sauce.",
    category: "Desserts",
    price: 279,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
    tags: ["Indulgent"],
    isFeatured: false,
    prepTime: 12
  }
];

export const coupons = [
  {
    code: "ROYAL10",
    type: "percent",
    value: 10,
    minOrder: 499,
    active: true
  },
  {
    code: "GOLD75",
    type: "flat",
    value: 75,
    minOrder: 699,
    active: true
  }
];

export const dictionary = {
  en: {
    home: "Home",
    menu: "Menu",
    cart: "Cart",
    checkout: "Checkout",
    dashboard: "Dashboard",
    reserve: "Reserve",
    admin: "Admin",
    search: "Search dishes",
    add: "Add",
    track: "Track"
  },
  hi: {
    home: "Home",
    menu: "Menu",
    cart: "Cart",
    checkout: "Checkout",
    dashboard: "Profile",
    reserve: "Reserve",
    admin: "Admin",
    search: "Dish khojein",
    add: "Add",
    track: "Track"
  }
};

export type Language = keyof typeof dictionary;

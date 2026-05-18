/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/routes/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/RootApp.tsx",
    "./src/main.tsx"
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#0e2e22",
          100: "#164532",
          500: "#2fb06f",
          600: "#248f5a",
          700: "#176241",
          900: "#04160f"
        },
        gold: {
          100: "#fff1c2",
          300: "#f6c95a",
          500: "#d99a19",
          700: "#94620b"
        },
        ink: "#fff7df",
        cream: "#06130e"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(2, 12, 8, 0.48)",
        gold: "0 18px 60px rgba(246, 201, 90, 0.18)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "restaurant-radial":
          "radial-gradient(circle at 12% 10%, rgba(246, 201, 90, 0.16), transparent 28%), radial-gradient(circle at 88% 12%, rgba(47, 176, 111, 0.18), transparent 24%), linear-gradient(180deg, #06130e 0%, #0a1d15 100%)"
      }
    }
  },
  plugins: []
};

module.exports = config;

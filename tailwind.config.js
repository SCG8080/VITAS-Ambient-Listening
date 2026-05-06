/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3e1f75",
        background: "#F9FAFB",
        card: "#FFFFFF",
        text: "#111827",
        textSecondary: "#6B7280",
        danger: "#EF4444",
        success: "#10B981"
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // 配置 Tailwind 与 Ant Design 共存
  corePlugins: {
    preflight: false, // 禁用 Tailwind 的基础样式重置，避免与 Ant Design 冲突
  },
}

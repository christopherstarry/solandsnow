import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFFBE6",
        "cream-dark": "#F2ECD5",
        sunshine: "#F0C040",
        "sunshine-dark": "#D9A820",
        sage: "#5A8C6A",
        "sage-dark": "#467054",
        sky: "#D9EDF2",
        wood: "#8B5A2B",
        "wood-dark": "#6B4423",
        charcoal: "#3E444B",
        rust: "#C47A3A",
        ink: "#3A3A3A",
      },
    },
  },
  plugins: [],
};
export default config;

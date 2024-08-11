import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: colors.orange,
        secondary: colors.yellow,
        warn: colors.indigo,
        error: colors.red,
        buttonPrimary: colors.orange[300],
        // buttonSecondary: colors.yellow[400],
      },
    },
  },
  plugins: [],
} satisfies Config;

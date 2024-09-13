import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
  // added build.module = "ES2022" to make remix build command complete. Before adding, was failing because I use top level await
  // referenced this answer on Github: https://github.com/remix-run/remix/issues/7969#issuecomment-1806322036
  // makes me question my "target" and "module" settings in tsconfig (current set to "target": "ES2022", "module": "ESNext" as of 9/13/2024)
  // read this SO post for some clarification, but didn't add much:
  // https://stackoverflow.com/questions/39493003/typescript-compile-options-module-vs-target
  build: {
    target: "ES2022",
  },
});

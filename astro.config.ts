// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
// import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
    output: "server",
    site: "https://bjornar.dev",

    // adapter: node({
    //     mode: "standalone",
    // }),
    adapter: vercel(),

    vite: {
        plugins: [tailwindcss()],
    },
});

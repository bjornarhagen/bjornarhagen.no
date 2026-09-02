// @ts-check
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";

// Container builds set BUILD_TARGET=container and use the standalone Node
// adapter, which emits dist/server/entry.mjs. Vercel builds set nothing and
// are unaffected by this.
const isContainer = process.env.BUILD_TARGET === "container";

// https://astro.build/config
export default defineConfig({
    output: "server",
    site: "https://bjornar.dev",

    adapter: isContainer ? node({ mode: "standalone" }) : vercel(),

    vite: {
        plugins: [tailwindcss()],
    },
});

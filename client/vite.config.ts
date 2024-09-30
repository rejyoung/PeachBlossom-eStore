import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    server: {
        port: 3000,
    },
    esbuild: {
        target: "esnext",
    },
    build: {
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    // If the asset is the webmanifest, do not include the hash
                    if (assetInfo.name === "site.webmanifest") {
                        return "[name][extname]";
                    }
                    return "[name]-[hash][extname]";
                },
            },
        },
    },
});

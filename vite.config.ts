import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "./app-debug",
		minify: false,
		emptyOutDir: false,
	},
	server: {
		port: 3000,
	}
});

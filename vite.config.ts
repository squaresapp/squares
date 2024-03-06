import { defineConfig } from "vite";

export default defineConfig({
	build: {
		outDir: "./app",
		minify: false,
		emptyOutDir: false,
	},
	server: {
		port: 3000,
	}
});

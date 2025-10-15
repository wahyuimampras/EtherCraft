import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
        input: {
            main: resolve(__dirname, 'index.html'),
            products: resolve(__dirname, 'products.html'),
            about: resolve(__dirname, 'about.html'),
        },
        },
    },
});
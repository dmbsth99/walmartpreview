// svelte.config.js
import adapter from '@sveltejs/adapter-vercel'; // Or adapter-static
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'; // <--- THIS ONE!

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(), // <--- AND THIS ONE!
    kit: {
        adapter: adapter()
    }
};

export default config;
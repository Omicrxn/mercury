import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import oxlintPlugin from 'vite-plugin-oxlint'

export default defineConfig({
	plugins: [oxlintPlugin(),sveltekit()],
});

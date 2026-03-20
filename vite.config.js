import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@common': path.resolve(__dirname, './src/common'),
            '@games': path.resolve(__dirname, './src/games'),
            '@shared': path.resolve(__dirname, './src/shared'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                /**
                 * loadPaths adds the `src/` directory to Sass's search path.
                 * This means `@use "common/styles/variables"` resolves to
                 * `src/common/styles/_variables.scss` from ANY file — regardless
                 * of where that file lives in the tree.
                 *
                 * Without loadPaths, Sass resolves @use paths relative to the
                 * importing file, so a file in src/styles/ would look for
                 * src/styles/common/... instead of src/common/...
                 */
                loadPaths: [path.resolve(__dirname, 'src')],
                /**
                 * Automatically inject `@use` imports into every .module.scss
                 * EXCEPT the partials themselves — that would create circular imports.
                 *
                 * Using the function form of additionalData lets us inspect the
                 * file path and skip injection for the design-token files.
                 */
                additionalData(content, filepath) {
                    const isPartial = filepath.includes('_variables.scss') ||
                        filepath.includes('_mixins.scss') ||
                        filepath.includes('_fonts.scss');
                    if (isPartial)
                        return content;
                    return (`@use "common/styles/variables" as vars;\n` +
                        `@use "common/styles/mixins" as mix;\n` +
                        content);
                },
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                /**
                 * Manual chunk strategy:
                 *  - vendor-react  : React, ReactDOM, React Router (always needed)
                 *  - vendor-query  : TanStack Query (shared data layer)
                 *  - vendor-pixi   : PixiJS v8 (lazy — only loads when /pixi-game is visited)
                 *  - vendor-gsap   : GSAP (lazy — dynamically imported in lobby + pixi-game)
                 *
                 * Each game's own code lives in its own auto-named chunk produced by
                 * React.lazy() + Vite's automatic code splitting. No game includes
                 * another game's code.
                 */
                manualChunks(id) {
                    if (id.includes('node_modules/pixi.js') || id.includes('node_modules/@pixi/')) {
                        return 'vendor-pixi';
                    }
                    if (id.includes('node_modules/gsap')) {
                        return 'vendor-gsap';
                    }
                    if (id.includes('node_modules/react/') ||
                        id.includes('node_modules/react-dom/') ||
                        id.includes('node_modules/react-router/')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/@tanstack/')) {
                        return 'vendor-query';
                    }
                },
            },
        },
    },
});

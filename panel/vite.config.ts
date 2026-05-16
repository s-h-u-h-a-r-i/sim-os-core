import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

/** Keep in sync with Python `sim_os` bridge default (see `docs/mod-browser-bridge.md`). */
const DEFAULT_BRIDGE_PORT = 8765

// https://vite.dev/config/
export default defineConfig({
  plugins: [solid()],
  base: '/',
  build: {
    outDir: '../dist/sim_os_panel',
    emptyOutDir: true,
    target: 'esnext',
  },
  server: {
    /** Hard-fixed port for local panel dev (`panel dev`). */
    port: 5173,
    strictPort: true,
    proxy: {
      '/ws': {
        target: `ws://127.0.0.1:${DEFAULT_BRIDGE_PORT}`,
        ws: true,
        changeOrigin: true,
      },
    },
  },
})

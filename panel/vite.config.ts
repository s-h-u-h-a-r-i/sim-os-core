import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Keep in sync with Python `sim_os` bridge default (see `docs/mod-browser-bridge.md`). */
const DEFAULT_BRIDGE_PORT = 8765

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: '../dist/sim_os_panel',
    emptyOutDir: true,
  },
  server: {
    /** Hard-fixed; must match `sim_os.bootstrap._DEV_VITE_ORIGIN` (5173). */
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

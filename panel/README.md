# sim_os panel

Browser UI served by the in-game **`sim_os`** bridge. Built with **Bun + Vite + React + TypeScript**.

## Commands

```sh
bun install     # deps + lockfile
bun dev         # dev server (/ws proxies to localhost:8765 — see vite.config.ts)
bun run build   # emits ../dist/sim_os_panel (also run via repo scripts/build.py)
```

From repo root, **`uv run python scripts/build.py`** runs **`bun run build`** automatically (requires **`bun`** on `PATH`), then builds **`dist/sim_os.ts4script`**.

---

Template docs from Vite follow.

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules — see upstream Vite + `typescript-eslint` docs.

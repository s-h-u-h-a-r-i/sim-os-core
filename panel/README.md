# sim_os panel

Browser UI served by the in-game **`sim_os`** bridge. Built with **Bun + Vite + SolidJS + TypeScript**.

## Commands

```sh
bun install     # deps + lockfile
bun dev         # dev server (/ws proxies to localhost:8765 — see vite.config.ts)
bun run build   # emits ../dist/sim_os_panel (also run via repo scripts/build.py)
```

From repo root, **`uv run python scripts/build.py`** runs **`bun run build`** automatically (requires **`bun`** on `PATH`), then builds **`dist/sim_os.ts4script`**.

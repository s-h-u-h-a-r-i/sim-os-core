#!/usr/bin/env python3
"""Package `<project>/sim_os` into dist/sim_os.ts4script.

Uses **Bun** under ``panel/`` for the React UI: ``bun run build`` writes
``dist/sim_os_panel/`` next to the compiled ``.ts4script``.

A .ts4script file is a ZIP archive that The Sims 4 loads from Mods/. The
package directory must sit at the root of the archive; ``PyZipFile.writepy``
compiles ``.py`` → ``.pyc`` and writes paths so imports match the folder name
(e.g. ``import sim_os`` for ``sim_os/``).

Requires ``bun`` on PATH. Run with Python **3.7** when targeting the game
(e.g. ``uv run python scripts/build.py``).

With ``--install``, copies ``dist/sim_os.ts4script`` **and** ``dist/sim_os_panel/``
into ``Mods/sim_os/``.
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import typing
import zipfile
from pathlib import Path
from zipfile import PyZipFile


def _bun_executable() -> str:
    found = shutil.which("bun")
    if found:
        return found
    fallback = Path("~/.bun/bin/bun").expanduser()
    if fallback.is_file():
        return str(fallback)
    raise SystemExit("bun not found on PATH and not at ~/.bun/bin/bun")

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

DEFAULT_MODS_DIR = Path("~/Documents/Electronic Arts/The Sims 4/Mods").expanduser()


def default_package_root(root: Path) -> Path:
    return root / "sim_os"


def resolve_mods_dir(cli: typing.Optional[Path]) -> Path:
    if cli is not None:
        return cli.expanduser().resolve()
    return DEFAULT_MODS_DIR.resolve()


def build_panel(dist_dir: Path, panel_dir: Path) -> Path:
    """Emit ``<dist_dir>/sim_os_panel`` via ``bun run build``."""
    if not panel_dir.is_dir():
        raise SystemExit(f"panel directory does not exist: {panel_dir}")
    dist_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [_bun_executable(), "run", "build"],
        cwd=panel_dir,
        check=True,
    )
    out = dist_dir / "sim_os_panel"
    if not out.is_dir():
        raise SystemExit(f"panel build did not produce {out}")
    return out


def _copytree_replace(src: Path, dst: Path) -> None:
    """Copy tree, replacing ``dst`` entirely (Python 3.7-compatible; no dirs_exist_ok)."""
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--package-root",
        type=Path,
        default=None,
        help="Python package directory to compile into the archive (default: <project>/sim_os).",
    )
    parser.add_argument(
        "--dist-dir",
        type=Path,
        default=PROJECT_ROOT / "dist",
        help="Output directory (default: <project>/dist).",
    )
    parser.add_argument(
        "--archive-name",
        default="sim_os.ts4script",
        help="Output filename (default: sim_os.ts4script).",
    )
    parser.add_argument(
        "--install",
        action="store_true",
        help=(
            "Copy dist/sim_os.ts4script and dist/sim_os_panel/ into Mods/sim_os/ after packaging."
        ),
    )
    parser.add_argument(
        "--mods-dir",
        type=Path,
        default=None,
        help=(
            "Path to the game's Mods folder (…/The Sims 4/Mods). "
            "Default when omitted: ~/Documents/Electronic Arts/The Sims 4/Mods."
        ),
    )
    args = parser.parse_args()

    src = (args.package_root or default_package_root(PROJECT_ROOT)).resolve()
    if not src.is_dir():
        raise SystemExit(f"source is not a directory: {src}")

    dist_dir = args.dist_dir.resolve()
    panel_dir = PROJECT_ROOT / "panel"
    build_panel(dist_dir, panel_dir)
    print(f"[build] panel -> {dist_dir / 'sim_os_panel'}")

    out = dist_dir / args.archive_name

    with PyZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writepy(str(src))

    size_kb = out.stat().st_size / 1024
    print(f"[build] {out} ({size_kb:.1f} KB)")
    with zipfile.ZipFile(out) as zf:
        for name in sorted(zf.namelist()):
            print(f"  {name}")

    if args.install:
        mods_dir = resolve_mods_dir(args.mods_dir)
        if not mods_dir.is_dir():
            raise SystemExit(f"Mods directory does not exist: {mods_dir}")
        dest_dir = mods_dir / "sim_os"
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest = dest_dir / out.name
        shutil.copy2(out, dest)
        print(f"[install] {dest}")
        panel_build = dist_dir / "sim_os_panel"
        if panel_build.is_dir():
            dest_panel = dest_dir / "sim_os_panel"
            _copytree_replace(panel_build, dest_panel)
            print(f"[install] {dest_panel}")


if __name__ == "__main__":
    main()

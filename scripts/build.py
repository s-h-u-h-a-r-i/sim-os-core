#!/usr/bin/env python3
"""Package `<project>/sim_os` into dist/sim_os.ts4script.

A .ts4script file is a ZIP archive that The Sims 4 loads from Mods/. The
package directory must sit at the root of the archive; ``PyZipFile.writepy``
compiles ``.py`` → ``.pyc`` and writes paths so imports match the folder name
(e.g. ``import sim_os`` for ``sim_os/``).

Run with Python **3.7** when targeting the game (e.g. ``uv run python scripts/build.py``).

With ``--install``, the built archive is copied to ``Mods/sim_os/<archive-name>``.
"""

from __future__ import annotations

import argparse
import shutil
import zipfile
from pathlib import Path
from zipfile import PyZipFile

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

DEFAULT_MODS_DIR = Path("~/Documents/Electronic Arts/The Sims 4/Mods").expanduser()


def default_package_root(root: Path) -> Path:
    return root / "sim_os"


def resolve_mods_dir(cli: Path | None) -> Path:
    if cli is not None:
        return cli.expanduser().resolve()
    return DEFAULT_MODS_DIR.resolve()


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
        help="Copy the built .ts4script into Mods/sim_os/ after packaging.",
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
    dist_dir.mkdir(parents=True, exist_ok=True)
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


if __name__ == "__main__":
    main()

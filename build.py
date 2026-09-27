"""Build the Vite frontend into Vercel's static public directory."""

import os
from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parent


def main() -> None:
    # Use shell=True for cross-platform compatibility (Windows npm.cmd and Linux npm)
    try:
        subprocess.run(
            ["npm", "ci", "--prefix", "frontend", "--workspaces=false"],
            cwd=ROOT,
            check=True,
            shell=(os.name == "nt"),
        )
    except Exception:
        subprocess.run(
            ["npm", "install", "--prefix", "frontend"],
            cwd=ROOT,
            check=True,
            shell=(os.name == "nt"),
        )
    subprocess.run(
        ["npm", "run", "build", "--prefix", "frontend"],
        cwd=ROOT,
        check=True,
        shell=(os.name == "nt"),
    )


if __name__ == "__main__":
    main()

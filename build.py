"""Build the Vite frontend into Vercel's static public directory."""

from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parent


def main() -> None:
    subprocess.run(
        ["npm", "ci", "--prefix", "frontend", "--workspaces=false"],
        cwd=ROOT,
        check=True,
    )
    subprocess.run(
        ["npm", "run", "build", "--prefix", "frontend"], cwd=ROOT, check=True
    )


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Run the production image checks used by source CI and central delivery."""
import argparse
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument("image")
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
subprocess.run(["sh", "scripts/test-production.sh", args.image], cwd=root, check=True)

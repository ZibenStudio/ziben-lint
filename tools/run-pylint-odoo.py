#!/usr/bin/env python3
"""Lance pylint-odoo avec le pylintrc de ce depot, ou qu'il soit clone.

pre-commit execute depuis le depot consommateur : un --rcfile relatif y
pointerait un fichier absent. Le chemin se resout depuis ce script.
"""

import subprocess
import sys
from pathlib import Path

RCFILE = Path(__file__).resolve().parent.parent / "pylintrc"
FAIL_ON = "W8160,W8125,W8116,F8101,R1720,R1705"

if __name__ == "__main__":
    sys.exit(
        subprocess.call(
            [sys.executable, "-m", "pylint", f"--rcfile={RCFILE}", f"--fail-on={FAIL_ON}", *sys.argv[1:]]
        )
    )

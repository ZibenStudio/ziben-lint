"""Lance pylint-odoo avec le pylintrc partage, ou que le paquet soit installe.

pre-commit execute depuis le depot consommateur : un --rcfile relatif y
pointerait un fichier absent. Le chemin se resout depuis ce module.
"""

import subprocess
import sys
from pathlib import Path

RCFILE = Path(__file__).resolve().parent / "pylintrc"

# Les codes qui refusent le commit. missing-return et
# consider-merging-classes-inherited n'y sont pas : ils rendent des faux
# positifs sur un codebase Odoo, voir le pylintrc.
FAIL_ON = "W8160,W8125,W8116,F8101,R1720,R1705"


def cli():
    sys.exit(
        subprocess.call(
            [
                sys.executable,
                "-m",
                "pylint",
                f"--rcfile={RCFILE}",
                f"--fail-on={FAIL_ON}",
                *sys.argv[1:],
            ]
        )
    )


if __name__ == "__main__":
    cli()

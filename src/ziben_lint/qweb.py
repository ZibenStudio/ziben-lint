#!/usr/bin/env python3
"""Ce que ni prettier ni les checks OCA ne regardent dans le XML Odoo.

Deux niveaux. Une ERREUR est une directive qu'Odoo 19 ne comprend plus, ou une
regle du AGENTS.md : elle refuse le commit. Un AVERTISSEMENT signale une forme
que le serveur accepte encore en la deconseillant a chaque rendu : il s'affiche
et laisse passer, parce que le repo en porte trop pour bloquer dessus, et parce
que la conversion n'est pas toujours neutre.
"""

import re
import sys
from pathlib import Path

COMMENT = re.compile(r"<!--.*?-->", re.DOTALL)

ERRORS = (
    (re.compile(r"\bt-raw\b"), "t-raw a disparu en Odoo 17, ecrire t-out"),
    (re.compile(r"<tree\b"), "<tree> est devenu <list> en Odoo 17"),
    (re.compile(r"\battrs\s*="), 'attrs= a disparu en Odoo 17, ecrire invisible="..."'),
    (re.compile(r"\bstates\s*="), 'states= a disparu en Odoo 17, ecrire invisible="..."'),
)

WARNINGS = (
    (
        re.compile(r"\bt-esc\b"),
        "t-esc est deconseille en Odoo 19, le serveur le signale a chaque rendu ; "
        "t-out echappe pareil, sauf si la valeur est un Markup",
    ),
    (
        re.compile(r'expr="[^"]*@class'),
        "xpath sur @class : @class vaut la chaine entiere, utiliser hasclass()",
    ),
)


def scan(path):
    source = COMMENT.sub("", path.read_text(encoding="utf-8"))
    errors, warnings = [], []
    for line_no, line in enumerate(source.split("\n"), start=1):
        for pattern, message in ERRORS:
            if pattern.search(line):
                errors.append(f"{path}:{line_no} {message}")
        for pattern, message in WARNINGS:
            if pattern.search(line):
                warnings.append(f"{path}:{line_no} {message}")
    return errors, warnings


def main(argv):
    paths = [Path(a) for a in argv] or sorted(Path(".").rglob("*.xml"))
    errors, warnings = [], []
    for path in paths:
        if path.suffix != ".xml" or not path.is_file():
            continue
        found_errors, found_warnings = scan(path)
        errors += found_errors
        warnings += found_warnings

    for warning in warnings:
        print(f"avertissement  {warning}")
    for error in errors:
        print(f"erreur         {error}")
    return 1 if errors else 0


def cli():
    sys.exit(main(sys.argv[1:]))


if __name__ == "__main__":
    cli()

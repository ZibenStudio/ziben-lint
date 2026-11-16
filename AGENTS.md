# AGENTS.md

Source unique des regles de lint des projets Odoo de Ziben. Consomme par
design-park, terre-et-jardin, odoo-ziben et mineral-deco.

## La regle d'or

**Rien de ce qui nomme un client n'entre ici.** Pas de prefixe de classe (`dp-`,
`tj_`), pas de jeton de charte (`--dp-*`), pas de nom de module, pas de chemin
propre a un depot. C'est ce qui permet de garder ce depot public, donc
consommable sans jeton d'acces.

Le partage : ce qui vaut pour n'importe quel projet Odoo 19. Le local : ce qui
decrit un client. Un doute se tranche par cette question, pas par la commodite.

## Deux canaux, et pourquoi pas un seul

Verifie par prototype, pas suppose.

**pre-commit** porte `qweb-lint` et `pylint-odoo`. Le projet consommateur
n'installe rien, le `pylintrc` voyage dans le paquet Python et
`pylint_runner.py` le resout depuis son propre chemin. Un `--rcfile` relatif
pointerait un fichier absent, pre-commit executant depuis le depot consommateur.

**npm** porte `stylelint.json` et `eslint.mjs`. ESLint ne peut pas passer par
pre-commit : sa configuration vit dans le depot consommateur, Node y resout ses
imports, et le cache de pre-commit n'est pas dans ce chemin. Message exact :
`Cannot find package '@ziben/lint-config' imported from .../eslint.config.mjs`.
C'est le meme piege qui rendait le hook prettier inoperant sur design-park.

Stylelint, lui, fonctionnerait par pre-commit. Il passe quand meme par npm :
sans `node_modules` local, l'editeur n'affiche aucune regle pendant la frappe et
le hook d'agent ne peut pas appeler `npx`. Le canal npm est necessaire de toute
facon, autant n'en avoir qu'un pour le front.

## Modifier une regle

1. Modifier `stylelint.json`, `eslint.mjs`, `src/ziben_lint/pylintrc` ou
   `src/ziben_lint/qweb.py`.
2. **Bumper `version` dans `package.json`** si le front a bouge. npm sert sinon
   la copie en cache et le changement passe inapercu. Piege rencontre.
3. Mesurer l'effet sur un vrai depot avant de taguer, jamais sur un exemple :
   pointer temporairement le `rev` d'un projet sur le SHA local et lancer
   `pre-commit run --all-files`.
4. Taguer. `rev: HEAD` n'est pas accepte par pre-commit, il exige une reference
   immuable et ignore silencieusement une branche.

Cote projets : `pre-commit autoupdate` pour le Python, `npm update
@ziben/lint-config` pour le front.

## Preset front

`eslint-front.mjs` (export `./eslint-front`) porte les regles TypeScript, React,
Next et Payload. Une regle ajoutee ou changee garde un cas mauvais et un cas bon
dans `fixtures/front` et une ligne dans `tools/test-front.mjs` (`npm run test:front`).

## Desactiver une regle

Seulement sur preuve, et la preuve va dans le message de commit. Les regles
deja ecartees l'ont ete apres verification cas par cas dans le core Odoo :

- `missing-return` : un compute, un onchange, une contrainte ou un hook Odoo ne
  retournent jamais rien. Vingt cas relus, aucun ne perdait de valeur.
- `consider-merging-classes-inherited` : demande un fichier par modele, alors
  que les depots rangent par sujet.
- `invalid-name` : frappe `setUp`, dont unittest impose le nom, et le registre
  en PascalCase que le core Odoo emploie lui-meme.
- `xml-not-valid-char-link` : valide l'extension par `^[.][a-zA-Z]+$`, ce qui
  refuse tout chiffre, donc `.woff2` comme `.mp4`.

## Deux pieges Odoo a ne pas reintroduire

`valid-odoo-versions` doit rester a **18.0**. pylint-odoo 9.3.2 ne connait pas
19.0 et desactive tous ses checks Odoo en silence si on l'y met.

`page-break-after` est signale deprecie au profit de `break-after`, mais
wkhtmltopdf, le moteur PDF d'Odoo, ne connait que l'ancienne propriete. La
remplacer casse la pagination des impressions.

## Poser l'outillage sur un nouveau projet

Travailler dans un worktree depuis la branche principale, jamais sur un
checkout qui porte du travail en cours.

Installer le hook avec `pre-commit install --allow-missing-config`. Sans cette
option, toute branche anterieure au commit d'outillage refuse le moindre
commit, faute de trouver le fichier de configuration.

Prevoir le reformatage `black` en commit separe, avec son SHA verse dans
`.git-blame-ignore-revs`. Il touche environ la moitie des fichiers Python d'un
depot qui n'a jamais eu de linter.

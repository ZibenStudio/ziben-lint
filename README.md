# ziben-lint

Regles de lint partagees par les projets Odoo de Ziben. Aucun code client, aucun
secret, aucun nom de module : ce depot ne porte que du generique Odoo, ce qui
permet de le garder public et donc consommable sans jeton.

## Ce qu'un projet y prend

Deux canaux, parce qu'aucun des deux ne couvre tout.

**pre-commit**, pour ce qui est en Python. Rien a installer dans le projet.

```yaml
- repo: https://github.com/ZibenStudio/ziben-lint
  rev: v1.0.0
  hooks:
    - id: qweb-lint
    - id: pylint-odoo
```

**npm**, pour stylelint et eslint. Le projet en a besoin de toute facon : sans
`node_modules` local, l'editeur n'affiche aucune regle pendant la frappe, et le
hook d'agent ne peut pas appeler `npx`.

```json
{ "devDependencies": { "@ziben/lint-config": "github:ZibenStudio/ziben-lint" } }
```

```json
// .stylelintrc.json du projet
{
  "extends": "@ziben/lint-config/stylelint",
  "rules": { "selector-class-pattern": ["^(?:(?!xx).*|xx_...)$"] }
}
```

```js
// eslint.config.mjs du projet
import base from '@ziben/lint-config/eslint';
export default [{ ignores: ['enterprise/**'] }, base];
```

## Ce qui reste au projet

Ce qui nomme un client n'a rien a faire ici : le prefixe de classe, les jetons
de charte, les couleurs, les modules tiers a exclure, les globals d'une lib
propre au projet. Le projet les ajoute par-dessus la base.

## Faire evoluer une regle

Un commit ici, un tag, puis dans chaque projet `pre-commit autoupdate` pour la
partie Python et `npm update @ziben/lint-config` pour la partie front.

**Bumper la version du package.json a chaque changement de stylelint.json ou
eslint.mjs.** npm sert sinon la copie en cache et le changement passe inapercu.

import js from '@eslint/js';
import globals from 'globals';

// Base Ziben pour le JS des modules Odoo 19. Aucune regle propre a un client :
// le projet ajoute ses ignores, ses globals et ses exceptions par-dessus.
export default {
    files: ['**/static/src/**/*.js'],
    languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: {
            ...globals.browser,
            odoo: 'readonly',
            owl: 'readonly',
            luxon: 'readonly',
        },
    },
    rules: {
        ...js.configs.recommended.rules,
        'no-console': ['error', { allow: ['error', 'warn'] }],
        'no-unused-vars': ['error', { args: 'none', caughtErrorsIgnorePattern: '^_' }],
        'no-empty': ['error', { allowEmptyCatch: true }],
        'no-var': 'error',
        'prefer-const': 'error',
        eqeqeq: ['error', 'smart'],

        // Anti-patterns Odoo 19. useService rend le composant testable ;
        // env.services le couple au runtime. Avertissement et non erreur,
        // parce qu'un modele Odoo n'a pas de useService a sa disposition.
        'no-restricted-syntax': [
            'warn',
            {
                selector: "MemberExpression[object.property.name='env'][property.name='services']",
                message: "env.services : passer par useService('nom')",
            },
            {
                selector: "CallExpression[callee.name='useState'] > NewExpression",
                message: 'useState sur un objet non plain casse la reactivite : useState({ value: ... })',
            },
        ],
        'no-restricted-globals': [
            'error',
            { name: '$', message: 'jQuery est proscrit en Odoo 19' },
            { name: 'jQuery', message: 'jQuery est proscrit en Odoo 19' },
        ],
        // Une Interaction porte sa racine dans this.el ; partir de document sort
        // du composant et casse des qu'il y a deux instances sur la page.
        'no-restricted-properties': [
            'warn',
            { object: 'document', property: 'querySelector', message: 'preferer this.el.querySelector ou useRef' },
            { object: 'document', property: 'querySelectorAll', message: 'preferer this.el.querySelectorAll' },
            { object: 'document', property: 'getElementById', message: 'preferer this.el ou useRef' },
            { object: 'document', property: 'getElementsByClassName', message: 'preferer this.el' },
        ],
    },
};

import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

// Preset des projets TypeScript, React, Next et Payload de Ziben. Traduit en
// erreurs de lint les regles de references/frontend. Aucune regle propre a un
// client : le projet ajoute ses ignores et ses exceptions par-dessus.
//
//   import { zibenFront } from '@ziben/lint-config/eslint-front';
//   export default [...zibenFront({ tsconfigRootDir: import.meta.dirname })];

const FILES = ['**/*.{ts,tsx,mts,cts}'];
const IS_CLIENT = "Program:has(> ExpressionStatement[directive='use client'])";
const IS_SERVER = "Program:has(> ImportDeclaration[source.value='server-only'])";
const SERVER_SOURCE = String.raw`/^server-only$|(^|\/)server\/|\.server$/`;
const CLIENT_SOURCE = String.raw`/^client-only$|\.client$/`;

const boundarySyntax = [
    {
        selector: `${IS_CLIENT} ImportDeclaration[source.value=${SERVER_SOURCE}]`,
        message:
            "Un composant 'use client' ne peut pas importer de code serveur (server-only, server/, *.server) : son code part dans le bundle navigateur. Lire la donnee dans un Server Component ou une Server Action et la passer en props.",
    },
    {
        selector: `${IS_SERVER} ImportDeclaration[source.value=${CLIENT_SOURCE}]`,
        message:
            'Un module server-only ne peut pas importer de code client (client-only, *.client). Garder la logique serveur dans son propre module et passer le resultat au composant client en props.',
    },
];

const useEffectSyntax = [
    {
        selector: "CallExpression[callee.name='useEffect'], CallExpression[callee.object.name='React'][callee.property.name='useEffect']",
        message:
            "useEffect sert a se synchroniser avec un systeme externe (abonnement, minuteur, API navigateur). Valeur derivee : la calculer au rendu. Reaction a un clic ou a un envoi : la mettre dans le gestionnaire d'evenement. Donnee a charger : la lire dans un Server Component. Si l'effet est vraiment une synchronisation, le ranger dans un hook du dossier effects/.",
    },
];

/**
 * @param {object} options
 * @param {string} options.tsconfigRootDir dossier du tsconfig, en general import.meta.dirname
 * @param {string[]} [options.effectsFolders] dossiers ou useEffect est autorise
 */
export function zibenFront({ tsconfigRootDir, effectsFolders = ['**/effects/**'] }) {
    return tseslint.config(
        ...tseslint.configs.strictTypeChecked.map((c) => ({ ...c, files: FILES })),
        ...tseslint.configs.stylisticTypeChecked.map((c) => ({ ...c, files: FILES })),
        {
            files: FILES,
            languageOptions: { parserOptions: { projectService: true, tsconfigRootDir } },
            plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
            settings: { react: { version: '19.0' } },
            rules: {
                ...jsxA11y.flatConfigs.recommended.rules,
                '@typescript-eslint/no-explicit-any': 'error',
                '@typescript-eslint/ban-ts-comment': [
                    'error',
                    {
                        'ts-expect-error': 'allow-with-description',
                        'ts-ignore': true,
                        'ts-nocheck': true,
                        minimumDescriptionLength: 10,
                    },
                ],
                '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
                'react/no-multi-comp': ['error', { ignoreStateless: false }],
                'react-hooks/rules-of-hooks': 'error',
                'react-hooks/exhaustive-deps': 'error',
                'no-console': ['error', { allow: ['error', 'warn'] }],
                'no-restricted-syntax': ['error', ...boundarySyntax, ...useEffectSyntax],
            },
        },
        {
            files: effectsFolders,
            rules: { 'no-restricted-syntax': ['error', ...boundarySyntax] },
        },
        { files: ['**/*.{js,mjs,cjs}'], ...tseslint.configs.disableTypeChecked },
    );
}

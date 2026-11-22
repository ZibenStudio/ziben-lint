// Chaque regle du preset front : un cas mauvais qui doit l'enfreindre, un cas
// bon qui doit passer sans aucune erreur.
import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../fixtures/front/', import.meta.url));
const cases = [
    ['no-explicit-any/bad.ts', '@typescript-eslint/no-explicit-any'],
    ['ban-ts-comment/bad.ts', '@typescript-eslint/ban-ts-comment'],
    ['no-multi-comp/bad.tsx', 'react/no-multi-comp'],
    ['consistent-type-definitions/bad.ts', '@typescript-eslint/consistent-type-definitions'],
    ['jsx-a11y/bad.tsx', 'jsx-a11y/click-events-have-key-events'],
    ['exhaustive-deps/bad.tsx', 'react-hooks/exhaustive-deps'],
    ['use-effect/bad.tsx', 'no-restricted-syntax', 'useEffect sert a'],
    ['client-imports-server/bad.tsx', 'no-restricted-syntax', "'use client' ne peut pas importer"],
    ['server-imports-client/bad.ts', 'no-restricted-syntax', 'server-only ne peut pas importer'],
    ['dot-notation/bad.ts', '@typescript-eslint/dot-notation'],
];
const goods = [
    'no-explicit-any/good.ts', 'ban-ts-comment/good.ts', 'no-multi-comp/good.tsx',
    'consistent-type-definitions/good.ts', 'jsx-a11y/good.tsx', 'exhaustive-deps/good.tsx',
    'use-effect/effects/good.tsx', 'client-imports-server/good.tsx', 'server-imports-client/good.ts',
    'dot-notation/good.ts',
];

const eslint = new ESLint({ cwd });
const lint = async (file) => (await eslint.lintFiles([file]))[0].messages;
let failed = 0;
const report = (ok, text) => {
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${text}`);
    if (!ok) failed++;
};

for (const [file, ruleId, text = ''] of cases) {
    const found = (await lint(file)).some((m) => m.ruleId === ruleId && m.message.includes(text));
    report(found, `${file} declenche ${ruleId}`);
}
for (const file of goods) {
    const msgs = await lint(file);
    report(msgs.length === 0, `${file} passe${msgs.length ? ` : ${msgs.map((m) => m.ruleId).join(', ')}` : ''}`);
}
process.exit(failed ? 1 : 0);

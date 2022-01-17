module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: ['standard', 'eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 13,
    },
    plugins: [
        '@typescript-eslint', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'prettier', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    rules: {
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    overrides: [
        {
            files: ['**/*.spec.ts'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
            },
        },
    ],
};

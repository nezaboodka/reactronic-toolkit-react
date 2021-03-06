module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    'project': './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  extends: ['plugin:@typescript-eslint/recommended'],
  'rules': {
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'prefer-const': 'error',
    // 'comma-dangle': ['error', 'always-multiline'],
    'no-trailing-spaces': 'error',
    'no-unexpected-multiline': 'error',
    'object-shorthand': ['error', 'always'],
    'import-order': 'off',
    'simple-import-sort/sort': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    // '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    "@typescript-eslint/no-var-requires": "off",
  },
  'overrides': [
    {
      'files': ['*.js', '*.jsx'],
      'rules': {
        '@typescript-eslint/explicit-function-return-type': 'off',
      }
    }
  ],
}

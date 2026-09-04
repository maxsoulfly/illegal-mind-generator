import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['server/**'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // Native browser dialogs were removed app-wide (see CLAUDE.md Known
      // Gotchas). Use the shared useConfirm() flow for confirmations and
      // useToast()/showToast() for fire-and-forget messages. These three
      // rules overlap deliberately so a reintroduction is caught whether it
      // is written as a bare global (`confirm(...)`), a `window.` property,
      // or a `globalThis.` property.
      'no-alert': 'error',
      'no-restricted-globals': [
        'error',
        { name: 'confirm', message: 'Use the shared useConfirm() flow, not window.confirm().' },
        { name: 'alert', message: 'Use useToast()/showToast(), not window.alert().' },
        { name: 'prompt', message: 'Use an in-app form/panel, not window.prompt().' },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'window', property: 'confirm', message: 'Use the shared useConfirm() flow, not window.confirm().' },
        { object: 'window', property: 'alert', message: 'Use useToast()/showToast(), not window.alert().' },
        { object: 'window', property: 'prompt', message: 'Use an in-app form/panel, not window.prompt().' },
        { object: 'globalThis', property: 'confirm', message: 'Use the shared useConfirm() flow, not confirm().' },
        { object: 'globalThis', property: 'alert', message: 'Use useToast()/showToast(), not alert().' },
        { object: 'globalThis', property: 'prompt', message: 'Use an in-app form/panel, not prompt().' },
      ],
    },
  },
  // The local API server (persistence migration, see
  // C:\Users\Max\.claude\plans\one-signal-many-terminals.md) runs under
  // Node, not the browser — no React/JSX here, so it gets its own block
  // instead of the react-scoped rules above.
  {
    files: ['server/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])

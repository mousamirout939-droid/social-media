import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // This rule flags the standard "fetch on mount / on dependency change"
      // pattern (e.g. loading a profile when :username changes), which React's
      // own docs list as a valid effect use case. It is used intentionally
      // and safely throughout this codebase (guarded with cleanup flags where
      // it matters), so we relax it rather than refactor idiomatic data
      // fetching into something more contorted.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])

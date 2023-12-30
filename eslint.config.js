// @ts-check
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

const compat = new FlatCompat()

export default [
  js.configs.recommended,
  ...compat.extends(
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
    'plugin:storybook/recommended'
  ),
  {
    files: ['**/*.{vue,ts}'],
    ignores: ['src/lib/api-schema.d.ts'],
    rules: {
      'no-undef': 'warn',
      'no-unused-vars': 'warn'
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        parser: typescriptParser
      }
    }
  }
]

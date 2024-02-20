// @ts-check
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

const compat = new FlatCompat()

export default [
  {
    ignores: ['src/lib/api/schema.d.ts', '**/dist/**']
  },
  {
    files: ['**/*.{vue,ts}']
  },
  js.configs.recommended,
  ...compat.extends(
    'plugin:vue/vue3-recommended',
    'plugin:storybook/recommended',
    'plugin:vuejs-accessibility/recommended',
    'prettier'
  ),
  {
    rules: {
      'no-undef': 'warn',
      'no-unused-vars': 'warn',
      'vue/component-name-in-template-casing': 'error',
      'vuejs-accessibility/label-has-for': [
        'error',
        {
          required: {
            some: ['nesting', 'id']
          }
        }
      ]
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        parser: typescriptParser
      }
    }
  },
  {
    files: ['src/components/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
]

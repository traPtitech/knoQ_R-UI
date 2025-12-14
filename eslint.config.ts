import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import typescriptEslint from 'typescript-eslint'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import unocss from '@unocss/eslint-config/flat'
import globals from 'globals'

export default typescriptEslint.config(
  { ignores: ['src/lib/api-schema.d.ts', '**/dist', 'src/env.d.ts'] },
  eslint.configs.recommended,
  typescriptEslint.configs.recommended,
  eslintPluginVue.configs['flat/recommended'],
  pluginVueA11y.configs['flat/recommended'],
  unocss,
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  },
  eslintConfigPrettier
)

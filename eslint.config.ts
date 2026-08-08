import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginVue from 'eslint-plugin-vue'
import typescriptEslint from 'typescript-eslint'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import unocss from '@unocss/eslint-config/flat'
import unicorn from 'eslint-plugin-unicorn'
import eslintComments from '@eslint-community/eslint-plugin-eslint-comments'
import globals from 'globals'

export default typescriptEslint.config(
  {
    ignores: ['src/lib/api/schema.d.ts', '**/dist', 'src/env.d.ts']
  },
  eslint.configs.recommended,
  typescriptEslint.configs.recommended,
  eslintPluginVue.configs['flat/recommended'],
  pluginVueA11y.configs['flat/recommended'],
  unocss,
  {
    files: ['**/*.{ts,vue}'],
    plugins: {
      unicorn,
      '@eslint-community/eslint-comments': eslintComments
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',

      // ネストした if は条件の組み合わせが見えにくく可読性が下がるため禁止する。
      // 早期 return / ガード節 / 関数分割で平坦化すること。
      'no-restricted-syntax': [
        'error',
        {
          selector: 'IfStatement > BlockStatement > IfStatement',
          message:
            '二重のifは禁止です。early returnやガード節を使ってネストを減らしてください。'
        }
      ],

      // CompositionAPI 形式が最新の Vue で推奨されているため。
      'vue/component-api-style': ['error', ['script-setup']],

      // <script> を JS で書くと型の恩恵を失うため、全コンポーネントで TS を強制。
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],

      // ランタイム宣言 ({ type: String, required: true } 形式) は TS 型と二重管理になり、
      // 片方を更新し忘れた瞬間に乖離する。型ベースなら TS 型が Single Source of Truth になる。
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/define-emits-declaration': ['error', 'type-based'],

      // スタイルは UnoCSS に集約してデザイントークンを一元管理する。
      // 既存トークン / shortcut で表現できない場合は uno.config.ts の theme・shortcuts を拡張する。
      'vue/no-restricted-block': ['error', 'style'],

      // SFC は「先にロジック、次にテンプレート」の順で読む方が概念フローとして自然。
      'vue/block-order': ['error', { order: ['script', 'template'] }],

      // any は型システムを部分的に無効化するため禁止。未知の型は unknown で受けて絞り込む。
      '@typescript-eslint/no-explicit-any': 'error',

      // eslint-disable は例外運用なので、なぜ外したかが将来の読み手に必要。
      '@eslint-community/eslint-comments/require-description': [
        'error',
        { ignore: [] }
      ],

      // '../foo' 形式の親相対パスはファイル移動でリンクが切れるリスクがあるため禁止する。
      // src ルートからの絶対参照 '/@/' エイリアスを使い、grep / 移動のしやすさを担保する。
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: "Use the '/@/' alias instead of parent-relative imports."
            }
          ]
        }
      ],

      // コールバックにはアロー関数を使う。function 式は独自の this を持つため、
      // Composition API や非同期処理で this を意図せずシャドウする事故が起きやすい。
      // アロー関数は this を字句的に継承するためこの種のバグを構造的に防げる。
      // auto-fix 可能なので PostToolUse フックで自動修正される。
      'prefer-arrow-callback': [
        'error',
        { allowNamedFunctions: false, allowUnboundThis: true }
      ]
    }
  },
  {
    files: ['src/**/*.vue'],
    plugins: { unicorn },
    rules: {
      // Vue コンポーネントは PascalCase。.ts ファイルと一目で区別できるようにする。
      'unicorn/filename-case': ['error', { case: 'pascalCase' }]
    }
  },
  {
    files: ['src/**/*.ts'],
    plugins: { unicorn },
    rules: {
      // Vue 以外は camelCase。PascalCase のファイルが見えたら「コンポーネントだ」と即わかる。
      'unicorn/filename-case': ['error', { case: 'camelCase' }]
    }
  },
  eslintConfigPrettier
)

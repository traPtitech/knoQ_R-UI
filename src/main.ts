import '@unocss/reset/tailwind-compat.css'
import 'uno.css'

const startApplication = async (): Promise<void> => {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { startMocking } = await import('/@/mocks/browser')
    await startMocking()
  }
  const { mountApp } = await import('/@/mountApp')
  mountApp()
}

export const applicationReady = startApplication().catch((error: unknown) => {
  console.error('Application startup failed', error)
  const target = document.querySelector('#app')
  if (target)
    target.textContent =
      'アプリを起動できませんでした．開発サーバーの設定を確認してください．'
})

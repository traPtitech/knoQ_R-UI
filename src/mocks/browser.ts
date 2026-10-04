import { setupWorker } from 'msw/browser'
import {
  createMockEnvironment,
  onUnhandledMockRequest
} from '/@/mocks/environment'
import { readMockOptions } from '/@/mocks/options'

export const startMocking = async (): Promise<void> => {
  const environment = createMockEnvironment(readMockOptions(import.meta.env))
  const worker = setupWorker(...environment.handlers)
  await worker.start({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    onUnhandledRequest: onUnhandledMockRequest
  })
  console.info('[mocks] Reproduction settings:', environment.context.options)
}

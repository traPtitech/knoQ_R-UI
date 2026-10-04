import { z } from 'zod'
import { DEFAULT_MOCK_SEED } from '/@/mocks/context'
import type { MockOptions } from '/@/mocks/types'

const environmentSchema = z.object({
  VITE_MOCK_SCENARIO: z
    .enum(['default', 'empty', 'error', 'slow'])
    .default('default'),
  VITE_MOCK_SEED: z.coerce.number().int().default(DEFAULT_MOCK_SEED),
  VITE_MOCK_NOW: z.iso.datetime({ offset: true }).optional()
})

export const readMockOptions = (
  environment: Record<string, unknown>
): MockOptions => {
  const config = environmentSchema.parse(environment)
  return {
    scenario: config.VITE_MOCK_SCENARIO,
    seed: config.VITE_MOCK_SEED,
    now: config.VITE_MOCK_NOW
  }
}

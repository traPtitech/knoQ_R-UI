import { Ref, ref, watchEffect } from 'vue'

export type SwrvState =
  | 'idle'
  | 'validating'
  | 'pending'
  | 'success'
  | 'error'
  | 'staleIfError'

export const useSwrvState = <Data = any, Error = any>(
  data: Ref<Data | undefined>,
  error: Ref<Error | undefined>,
  isValidating: Ref<boolean>
) => {
  const state = ref<SwrvState>('idle')
  watchEffect(() => {
    if (data.value && isValidating.value) {
      state.value = 'validating'
      return
    }
    if (data.value && error.value) {
      state.value = 'staleIfError'
      return
    }
    if (data.value === undefined && !error.value) {
      state.value = 'pending'
      return
    }
    if (data.value && !error.value) {
      state.value = 'success'
      return
    }
    if (data.value === undefined && error.value) {
      state.value = 'error'
      return
    }
  })
  return { state }
}

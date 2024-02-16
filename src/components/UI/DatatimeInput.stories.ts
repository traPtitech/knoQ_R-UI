import { Meta, StoryObj } from '@storybook/vue3'
import DatetimeInput from './DatetimeInput.vue'

const meta: Meta<typeof DatetimeInput> = {
  component: DatetimeInput
}

export default meta

export const Default: StoryObj<typeof DatetimeInput> = {
  render: (args) => ({
    components: { DatetimeInput },
    setup: () => {
      return { args }
    },
    template: '<DatetimeInput v-bind="args" />'
  }),
  args: {
    label: 'ラベル'
  }
}

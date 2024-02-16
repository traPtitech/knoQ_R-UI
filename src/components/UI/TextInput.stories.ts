import { Meta, StoryObj } from '@storybook/vue3'
import TextInput from './TextInput.vue'

const meta: Meta<typeof TextInput> = {
  component: TextInput
}

export default meta

export const Default: StoryObj<typeof TextInput> = {
  render: (args) => ({
    components: { TextInput },
    setup: () => {
      return { args }
    },
    template: '<TextInput v-bind="args" />'
  }),
  args: {
    label: 'ラベル'
  }
}

import { Meta, StoryObj } from '@storybook/vue3'
import Checkbox from './Checkbox.vue'

const meta: Meta<typeof Checkbox> = {
  component: Checkbox
}

export default meta

export const Default: StoryObj<typeof Checkbox> = {
  render: (args) => ({
    components: { Checkbox },
    setup: () => {
      return { args }
    },
    template: '<Checkbox v-bind="args" />'
  }),
  args: {
    label: 'ラベル'
  }
}

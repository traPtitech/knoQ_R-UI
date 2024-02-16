import { Meta, StoryObj } from '@storybook/vue3'
import Button from './Button.vue'
const meta: Meta<typeof Button> = {
  component: Button
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  render: (args) => ({
    components: { Button },
    setup: () => {
      return { args }
    },
    template: '<Button v-bind="args"/>'
  }),
  args: {
    name: 'ボタン'
  }
}

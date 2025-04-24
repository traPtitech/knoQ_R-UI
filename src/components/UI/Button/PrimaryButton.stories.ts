import { Meta, StoryObj } from '@storybook/vue3'
import AButton from './AButton.vue'
const meta: Meta<typeof AButton> = {
  component: AButton
}

export default meta

type Story = StoryObj<typeof AButton>

export const Primary: Story = {
  render: (args) => ({
    components: { AButton },
    setup: () => {
      return { args }
    },
    template: '<AButton v-bind="args"/>'
  }),
  args: {
    name: 'ボタン'
  }
}

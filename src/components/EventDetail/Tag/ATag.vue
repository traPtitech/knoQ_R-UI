<template>
  <RouterLink :to="tagPath" :class="$style.link">
    <span :class="$style.tag">{{ tag.name }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { ResponseTag } from "../../../api/generated";
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps<{ tag: ResponseTag }>();
const tagPath = computed(() => {
  return `/events?tags=${props.tag.tagId}`;
});
</script>

<style lang="scss" module>
.link {
  text-decoration: none;
}

.tag {
  @include size-caption;
  @include color-ui-secondary;
  background-color: $bg-secondary;
  border-radius: 4px;
  padding: 4px;

  &:hover {
    background-color: $bg-tertiary;
  }
}
</style>

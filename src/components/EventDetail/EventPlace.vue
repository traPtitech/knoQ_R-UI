<template>
  <div :class="$style.placeitem">
    <span :class="$style.place_left">
      <a-icon :class="$style.appicon" name="zoom" />
      <span>{{ props.place }}</span>
    </span>
    <span>
      <a-icon :class="$style.appicon" name="location" />
    </span>
  </div>
</template>

<script setup lang="ts">
import AIcon from '../UI/AIcon.vue'
const props = defineProps<{ place: string }>()
</script>

<style lang="scss" module>
.place_left {
  flex-grow: 1;
}

.placeitem {
  font-size: 24pt;
  border-bottom: solid;
  display: inline-flex;
  width: 720px;
  max-width: 80%;
}

.appicon {
  margin: 0 12px 0 12px;
}
</style>

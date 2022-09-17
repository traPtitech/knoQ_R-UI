<template>
  <div :class="$style.placeitems">
    <div :class="$style.placeitem">
      <span :class="$style.place_left">
        <a-icon :class="$style.appicon" />
        <span>Discord #traQ</span>
      </span>
      <a-icon name="location" />
    </div>
    <div :class="$style.placeitem">
      <span :class="$style.place_left">
        <a-icon name="zoom" :class="$style.appicon" />
        <span>zoom</span>
      </span>
      <a-icon name="location" :class="$style.locationicon" />
    </div>
    <div :class="$style.placeitem">
      <span :class="$style.place_left">
        <a-icon :class="$style.appicon" />
        <span>W933</span>
      </span>
      <a-icon name="location" :class="$style.locationicon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import AIcon from "../UI/AIcon.vue";
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
.placeitems {
  display: flexbox;
}
.appicon {
  margin: 0 12px 0 12px;
}
</style>

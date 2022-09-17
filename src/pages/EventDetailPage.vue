<template>
  <event-title />
  <tags />
  <div :class="$style.hoge">日時</div>
  <event-date />
  <div :class="$style.hoge">場所</div>
  <event-place />
  <h2>説明</h2>
  <description />
  <div>
    ## knoQ meeting 今日は自由進捗会です。参加するしないは自由です。
    質問などある方は気軽に聞きにきてください。
  </div>
  <h2>グループ</h2>
  <group />
  <h2>管理者</h2>
  <h2>自分の参加予定</h2>
  <h2>参加者</h2>
</template>

<script setup lang="ts">
import EventTitle from "../components/EventDetail/EventTitle.vue";
import EventDate from "../components/EventDetail/EventDate.vue";
import EventPlace from "../components/EventDetail/EventPlace.vue";

//const props = defineProps<{}>();
</script>

<style lang="scss" module>
.hoge {
  color: #8a9899;
  font-size: 16pt;
}
</style>

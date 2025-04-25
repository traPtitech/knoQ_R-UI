<script setup lang="ts">
import EventCard from './EventCard.vue'
</script>

<template>
  <div>
    <p>参加予定のイベント</p>
    <div grid gap-1>
      <div grid gap-1>
        <div>2月22日(月)</div>
        <div grid gap-1>
          <EventCard />
        </div>
      </div>
      <div grid gap-1>
        <div>2月23日(火)</div>
      </div>
      <div grid gap-1>
        <EventCard />
        <EventCard />
        <EventCard />
      </div>
    </div>
  </div>
</template>

<template>
  <div>
    <UCard>
      <template #header>
        <div class="text-center">
          <h1 class="text-(--ui-text-highlighted)">{{ generalStore.websiteName }}</h1>
        </div>
      </template>
      <div class="text-center">
        <p class="text-(--ui-text)">{{ generalStore.description }}</p>
        <p class="text-(--ui-text)">{{ generalStore.disclaimer }}</p>
      </div>
    </UCard>
    <UContainer class="mt-20 mx-auto w-200 flex">
      <div class="w-[50%] border-l-1 border-(--ui-border-muted)">
        <UButton leading-icon="lucide:calendar-days" label="Calendar" to="/calendar" variant="outline" color="neutral"
          size="xl" class="rounded-l-none" />
        <USeparator />
        <p class="mt-5 mx-5">{{ generalStore.calendarDescription }}</p>
      </div>
      <div class="w-[50%] border-l-1 border-(--ui-border-muted)">
        <UButton leading-icon="lucide:calendar-days" label="More soon" to="/calendar" variant="outline" color="neutral"
          size="xl" class="rounded-l-none" disabled />
        <USeparator />
        <p class="mt-5 mx-5">More coming soon. I have my next component/page thought out, but I need to find some time to implement it.</p>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">

const generalStore = useGeneralStore()
</script>

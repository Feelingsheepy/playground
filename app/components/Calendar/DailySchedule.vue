<script setup lang="ts">
import type { DateValue, Time } from '@internationalized/date'

const calendarStore = useCalendarStore()

const collapsibleOpen = ref(false)

const getNumRows = () => {
  return ((calendarStore.workEnd * 60) - (calendarStore.workStart * 60)) / 15
}

const getRowsUsed = (mins: number) => {
  return (Math.floor(mins / 15) / getNumRows()) * 100
}

const scheduleClicked = (index: number) => {
  if (calendarStore.scheduleItemSelected == index && collapsibleOpen.value) {
    collapsibleOpen.value = false
    return
  }

  collapsibleOpen.value = true
  calendarStore.scheduleItemSelected = index
}


async function deleteEvent() {
  var response = await calendarStore.deleteEvent()
}

</script>

<template>
  <div class="flex h-[480px]">
    <div class="w-20 h-full flex flex-col">
      <div v-for="(n, i) in (calendarStore.workEnd - calendarStore.workStart)"
        class="relative flex-1 text-xs border-b-1 border-r-1">
        <p class="mx-1 absolute right-4 top-0.5">{{ padTimeToString({ hours: calendarStore.workStart + i }) }}</p>
        <div class="w-full h-full justify-items-end">
          <div v-for="j in 4" class="border-b-1 border-(--ui-border-muted) h-[25%] w-3" />
        </div>
      </div>
    </div>
    <div orientation="vertical" class="h-full w-full flex flex-col">
      <UButton v-for="(item, index) in calendarStore.getSchedule" :label="item.calendarEvent.name"
        :color="calendarStore.definedTags[item.calendarEvent.tag]?.color"
        class="w-full shrink-0 cursor-pointer rounded-md not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none first:rounded-s-none last:rounded-s-none"
        :style="'height: ' + getRowsUsed(item.endMins - item.startMins) + '%'" @click="scheduleClicked(index)" />
    </div>
    <UCollapsible v-model:open="collapsibleOpen" class="h-full" :ui="{
      content: 'data-[state=open]:animate-collapsible-left data-[state=closed]:animate-collapsible-right'
    }">
      <template #content>
        <div class="w-60">
          <div class="mx-5 relative">
            <p>{{ calendarStore.getScheduleItem?.name }}</p>
            <p class="text-(--ui-text-muted) text-sm">{{ timeToString(<Time>calendarStore.getScheduleItem?.startTime)
                }}-{{ timeToString(<Time>calendarStore.getScheduleItem?.endTime) }}</p>
            <UButton :label="calendarStore.definedTags[<number>calendarStore.getScheduleItem?.tag]?.name"
              :color="calendarStore.definedTags[<number>calendarStore.getScheduleItem?.tag]?.color"
              class="text-xs mt-2" />
            <UButton icon="mdi:delete" variant="outline" color="error" class="absolute right-2 top-2 cursor-pointer"
              @click="calendarStore.deleteEvent" />
            <USeparator class="pt-2" />
          </div>
        </div>
        <UCollapsible class="mx-5 mt-2">
          <UButton icon="mdi:plus" variant="outline" color="neutral" class="rounded-full" />
          <template #content>
            <CalendarCreateEvent class="pt-2" />
          </template>
        </UCollapsible>
      </template>
    </UCollapsible>
  </div>
</template>
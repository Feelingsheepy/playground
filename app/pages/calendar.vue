<script setup lang="ts">
import { isWeekday, isWeekend, type DateValue } from '@internationalized/date'

const calendarStore = useCalendarStore()
const tagsOpen = ref(false)
const dayOpen = ref(false)
const manageTagsOpen = ref(false)

const isDateDisabled = (date: DateValue) => {
  return isWeekend(date, 'en-US')
}

const manageTags = () => {
  manageTagsOpen.value = true
}

const selectDay = (newValue: DateValue) => {
  calendarStore.selectedDay = newValue
  dayOpen.value = true
}

</script>

<template>
  <div>
    <UContainer class="mt-5">
      <UCalendar :v-model="calendarStore.today" :min-value="getToday()" :year-controls="false" size="lg"
        v-on:update:model-value="selectDay" :is-date-disabled="isDateDisabled" :ui="{
          cell: 'mx-auto',
          gridWeekDaysRow: 'mx-auto',
          header: 'h-4',
          cellTrigger: ['cursor-pointer'],
        }">
        <template #heading="{ value }">
          <div class="flex gap-3">
            <p>{{ value }}</p>
            <UPopover v-model:open="tagsOpen">
              <UButton :label="calendarStore.getEnabledTag.name" :color="calendarStore.getEnabledTag.color"
                class="cursor-pointer" trailing-icon="lucide:chevron-down" size="xs" />
              <template #content>
                <UButtonGroup orientation="vertical" @click="tagsOpen = false">
                  <UButton v-for="(tag, index) in calendarStore.definedTags" :label="tag.name" :color="tag.color"
                    class="cursor-pointer" @click="calendarStore.enabledTag = index" />
                  <UButton label="Manage tags" variant="outline" color="neutral" class="cursor-pointer"
                    @click="manageTags" />
                </UButtonGroup>
              </template>
            </UPopover>
          </div>
        </template>
        <template #day="{ day }">
          <div>
            {{ day.day }}
            <div v-if="isWeekday(day, 'en-US')" class="absolute right-4 -bottom-2 w-15">
              <UChip :text="padTimeToString(calendarStore.getTotalTimeForDay(day))" size="xl"
                :color="calendarStore.getEnabledTag.color" standalone class="float-end m-0.5" :ui="{
                  base: 'rounded-xs'
                }" />
            </div>
          </div>
        </template>
      </UCalendar>
    </UContainer>
    <UDrawer v-model:open="dayOpen" :overlay="false" :handle="true"
      :title="toReadableString(<DateValue>calendarStore.selectedDay)" description="Daily Schedule">
      <template #body>
        <div class="h-full ">
          <CalendarDailySchedule :date="<DateValue>calendarStore.selectedDay" />
        </div>
      </template>
    </UDrawer>
    <UModal v-model:open="manageTagsOpen" :overlay="false" title="Manage Tags" description="Rename, recolour, remove or add tags" :ui="{
      content: 'w-75'
    }">
      <template #body>
        <div>
          <div v-for="(tag, index) in calendarStore.definedTags" class="pb-2 w-full relative">
            <UInput v-model="tag.name" highlight :color="tag.color" />
            <UPopover>
              <UButton :color="tag.color" class="rounded-full cursor-pointer size-5 mx-2" />
              <template #content>
                <div>
                  <UButton color="error" @click="tag.color = 'error'" class="rounded-full cursor-pointer size-5 m-2" />
                  <UButton color="info" @click="tag.color = 'info'" class="rounded-full cursor-pointer size-5 m-2" />
                  <UButton color="neutral" @click="tag.color = 'neutral'"
                    class="rounded-full cursor-pointer size-5 m-2" />
                  <UButton color="primary" @click="tag.color = 'primary'"
                    class="rounded-full cursor-pointer size-5 m-2" />
                  <UButton color="secondary" @click="tag.color = 'secondary'"
                    class="rounded-full cursor-pointer size-5 m-2" />
                  <UButton color="success" @click="tag.color = 'success'"
                    class="rounded-full cursor-pointer size-5 m-2" />
                  <UButton color="warning" @click="tag.color = 'warning'"
                    class="rounded-full cursor-pointer size-5 m-2" />
                </div>
              </template>
            </UPopover>
            <UButton v-if="index > 2" icon="mdi:delete" variant="ghost" color="error" size="md" class="absolute right-0.5 top-0.5 cursor-pointer" @click="calendarStore.definedTags.splice(index, 1)" />
          </div>
          <UButton icon="mdi:plus" variant="outline" class="cursor-pointer" @click="calendarStore.definedTags.push({ name: 'new tag', color: 'warning' })" />
        </div>
      </template>
    </UModal>
  </div>
</template>
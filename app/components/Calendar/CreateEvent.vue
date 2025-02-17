<script setup lang="ts">
import { Time, type DateValue } from '@internationalized/date'
import type { FormSubmitEvent } from '@nuxt/ui'
import { z } from 'zod'

const calendarStore = useCalendarStore()

const createSchema = z.object({
  name: z.string().min(2),
  startTime: z.string().regex(/\d{2}:\d{2}/, "Time format expected is HH:mm")
    .refine((str) => {
      const [hour, minute] = str.split(":").map((d) => parseInt(d));
      return (
        hour != undefined &&
        minute != undefined &&
        minute % 15 == 0
      )
    }, {
      message: 'Minutes must be in increments of 15'
    })
    .refine((str) => {
      const [hour, minute] = str.split(":").map((d) => parseInt(d));
      return (
        hour != undefined &&
        minute != undefined &&
        minute >= 0 &&
        minute < 60
      )
    }, {
      message: 'Must be a valid time'
    })
    .refine((str) => {
      const [hour, minute] = str.split(":").map((d) => parseInt(d));
      return (
        hour != undefined &&
        minute != undefined &&
        hour >= calendarStore.workStart &&
        hour <= calendarStore.workEnd - 1
      )
    }, {
      message: 'Must be during working hours'
    }),
  endTime: z.string().regex(/\d{2}:\d{2}/, "Time format expected is HH:mm")
    .refine((str) => {
      const [hour, minute] = str.split(":").map((d) => parseInt(d));
      return (
        hour != undefined &&
        minute != undefined &&
        minute % 15 == 0
      )
    }, {
      message: 'Minutes must be in increments of 15'
    })
    .refine((str) => {
      const [hour, minute] = str.split(":").map((d) => parseInt(d));
      return (
        hour != undefined &&
        minute != undefined &&
        minute >= 0 &&
        minute < 60
      )
    }, {
      message: 'Must be a valid time'
    })
    .refine((str) => {
      const [hour, minute] = str.split(":").map((d) => parseInt(d));
      return (
        hour != undefined &&
        minute != undefined &&
        hour >= calendarStore.workStart &&
        (hour <= calendarStore.workEnd - 1 || (hour == calendarStore.workEnd && minute == 0))
      )
    }, {
      message: 'Must be during working hours'
    }),
  tag: z.number().gte(1).lte(calendarStore.definedTags.length),
})

type CreateSchema = z.output<typeof createSchema>
const createState = reactive(<Partial<CreateSchema>>{
  name: undefined,
  startTime: padTimeToString({ hours: calendarStore.workStart }),
  endTime: padTimeToString({ hours: calendarStore.workStart, minutes: 15 }),
  tag: 1
})

const tagsOpen = ref(false)

const toast = useToast()
async function createEvent(event: FormSubmitEvent<CreateSchema>) {
  const [sHour, sMinute] = event.data.startTime.split(":").map((d) => parseInt(d));
  const [eHour, eMinute] = event.data.endTime.split(":").map((d) => parseInt(d));

  var response = await calendarStore.createEvent({
    name: event.data.name,
    tag: event.data.tag,
    startTime: new Time(sHour, sMinute),
    endTime: new Time(eHour, eMinute)
  })

  if (response.success) {
    toast.add({ title: 'Created event', description: 'Created new event ' + event.data.name, color: 'success', icon: 'lucide:calendar-days' })
  }
  else {
    toast.add({ title: 'Creation failed', description: response.message, color: 'error', icon: 'lucide:calendar-days' })
  }
}
</script>

<template>
  <div>
    <USeparator />
    <UForm :state="createState" :schema="createSchema" @submit="createEvent" class="mt-2">
      <UFormField name="name" class="pb-5" :ui="{ error: 'w-50 text-xs' }">
        <UInput v-model="createState.name" placeholder="" :ui="{ base: 'peer' }">
          <label class="pointer-events-none absolute left-0 -top-2.5 text-(--ui-text-highlighted) text-xs font-medium px-1.5
            transition-all peer-focus:-top-2.5 peer-focus:text-(--ui-text-highlighted) peer-focus:text-xs
            peer-focus:font-medium peer-placeholder-shown:text-sm peer-placeholder-shown:text-(--ui-text-dimmed)
            peer-placeholder-shown:top-1.5 peer-placeholder-shown:font-normal">
            <span class="inline-flex bg-(--ui-bg) px-1">Name</span>
          </label>
        </UInput>
      </UFormField>
      <div class="flex gap-0.5 pb-5">
        <UFormField name="startTime" :ui="{ error: 'w-23 text-xs' }">
          <UInput type="time" v-model="createState.startTime" :step="15 * 60"
            :min="padTimeToString({ hours: calendarStore.workStart })"
            :max="padTimeToString({ hours: calendarStore.workEnd - 1, minutes: 45 })">
            <label
              class="pointer-events-none absolute left-0 -top-2.5 text-(--ui-text-highlighted) text-xs font-medium px-1.5">
              <span class="inline-flex bg-(--ui-bg) px-1">Start</span>
            </label>
          </UInput>
        </UFormField>
        <USeparator orientation="vertical" />
        <UFormField name="endTime" :ui="{ error: 'w-23 text-xs' }">
          <UInput type="time" v-model="createState.endTime" :step="15 * 60"
            :min="padTimeToString({ hours: calendarStore.workStart, minutes: 15 })"
            :max="padTimeToString({ hours: calendarStore.workEnd, minutes: 0 })">
            <label
              class="pointer-events-none absolute left-0 -top-2.5 text-(--ui-text-highlighted) text-xs font-medium px-1.5">
              <span class="inline-flex bg-(--ui-bg) px-1">End</span>
            </label>
          </UInput>
        </UFormField>
      </div>
      <UFormField name="tag">
        <UInput hidden v-model="createState.tag" />
        <UPopover v-model:open="tagsOpen">
          <UButton :label="calendarStore.definedTags[createState.tag].name"
            :color="calendarStore.definedTags[createState.tag].color" class="cursor-pointer"
            trailing-icon="lucide:chevron-down" size="xs" />
          <template #content>
            <UButtonGroup orientation="vertical" @click="tagsOpen = false">
              <UButton v-for="(tag, index) in calendarStore.definedTags.slice(1)" :label="tag.name" :color="tag.color"
                class="cursor-pointer" @click="createState.tag = index + 1" />
            </UButtonGroup>
          </template>
        </UPopover>
      </UFormField>
      <UButton type="submit" label="Create" class="float-end mx-2" />
    </UForm>
  </div>
</template>
import { Time, isWeekend, type TimeDuration, isWeekday, type DateValue } from '@internationalized/date'
import { defineStore } from 'pinia'

interface CalendarTag {
  name: string,
  color: "success" | "error" | "neutral" | "primary" | "secondary" | "info" | "warning" | undefined
}

interface CalendarEvent {
  name: string,
  startTime: Time,
  endTime: Time,
  tag: number,
}

interface ScheduleEvent {
  startMins: number,
  endMins: number,
  calendarEvent: CalendarEvent,
}

interface IEventResponse {
  success: boolean,
  message: string
}

const toast = useToast()

function getDefaultDailyEvents() {
  var defaultDailyEvents = [
    {
      name: 'Standup',
      startTime: new Time(8),
      endTime: new Time(9),
      tag: 2
    }
  ] as CalendarEvent[]

  return defaultDailyEvents
}

export const useCalendarStore = defineStore('calendarStore', {
  state: () => ({
    definedTags: [
      {
        name: 'free',
        color: 'success',
      },
      {
        name: 'off',
        color: 'neutral',
      },
      {
        name: 'meeting',
        color: 'error',
      },
    ] as CalendarTag[],
    calendarEvents: new Map<string, CalendarEvent[]>(),
    dailyEvents: getDefaultDailyEvents(),
    enabledTag: 0,
    workStart: 8,
    workEnd: 18,
    today: getToday(),
    selectedDay: getToday(),
    scheduleItemSelected: 0,
  }),
  getters: {
    getDailyEvents(state) {
      return (day: DateValue, overrideTag?: number) => {
        var dailyEvents = [] as CalendarEvent[]
        var tag = overrideTag ? overrideTag : state.enabledTag
        //Off time
        if (tag == 1) {
          if (isWeekend(day, 'en-US')) {
            dailyEvents.push({
              name: 'Not Working',
              startTime: new Time(0),
              endTime: new Time(23, 59, 59),
              tag: 1
            })
          }
          else {
            dailyEvents.push({
              name: 'Not Working',
              startTime: new Time(0),
              endTime: new Time(state.workStart),
              tag: 1
            }, {
              name: 'Not Working',
              startTime: new Time(state.workEnd),
              endTime: new Time(23, 59, 59),
              tag: 1
            })
          }
        }

        if (isWeekday(day, 'en-US')) {
          dailyEvents.push(...<CalendarEvent[]>state.dailyEvents.filter((event) => event.tag == tag))
        }

        return dailyEvents
      }
    },
    getFreeTime(state) {
      return (date: DateValue) => {
        var totalTime: TimeDuration = {}
        //ignore free time
        for (var i = 1; i < state.definedTags.length; i++) {
          totalTime = addDuration(totalTime, this.getTotalTimeForDay(date, i))
        }

        return subtractDuration({ hours: 24 }, totalTime)
      }
    },
    getTotalTimeForDay(state) {
      return (date: DateValue, overrideTag?: number) => {
        var tag = overrideTag ? overrideTag : state.enabledTag

        if (tag == 0) return this.getFreeTime(date)

        var eventsOnDay = [] as CalendarEvent[]
        if (state.calendarEvents.has(date.toString())) eventsOnDay.push(...<CalendarEvent[]>state.calendarEvents.get(date.toString())?.filter((e) => e.tag == tag))
        eventsOnDay?.push(...this.getDailyEvents(date, tag))

        var totalDuration = eventsOnDay?.reduce((accumulator, currentValue) => addDuration(accumulator, getDurationNearestMinute(<Time>currentValue.endTime, <Time>currentValue.startTime)), { hours: 0, minutes: 0 } as TimeDuration)

        return totalDuration ? totalDuration : { hours: 0, minutes: 0 } as TimeDuration
      }
    },
    getEnabledTag(state) {
      return state.definedTags.at(state.enabledTag) || { name: 'unknown', color: undefined }
    },
    getSchedule(state) {
      var allEvents = [] as CalendarEvent[]
      allEvents.push(...<CalendarEvent[]>state.dailyEvents)
      var schedule: ScheduleEvent[] = []

      if (state.calendarEvents.has(this.selectedDay.toString())) {
        allEvents.push(...<CalendarEvent[]>state.calendarEvents.get(this.selectedDay.toString()))
      }

      var currentMins = state.workStart * 60

      for (var i = 0; i < allEvents.length; i++) {
        var calendarEvent = <CalendarEvent>allEvents.at(i)
        var startMins = (calendarEvent.startTime.hour * 60) + calendarEvent.startTime.minute
        var endMins = (calendarEvent.endTime.hour * 60) + calendarEvent.endTime.minute

        if (startMins > currentMins) {
          schedule.push(({
            startMins: currentMins,
            endMins: startMins,
            calendarEvent: {
              name: 'Free Time',
              startTime: new Time(Math.floor(currentMins / 60), currentMins % 60),
              endTime: new Time(Math.floor(startMins / 60), startMins % 60),
              tag: 0
            }
          }))
        }

        schedule.push({
          startMins: startMins,
          endMins: endMins,
          calendarEvent: calendarEvent,
        })

        currentMins = endMins
      }

      if (currentMins < state.workEnd * 60) {
        schedule.push(({
          startMins: currentMins,
          endMins: state.workEnd * 60,
          calendarEvent: {
            name: 'Free Time',
            startTime: new Time(Math.floor(currentMins / 60), currentMins % 60),
            endTime: new Time(state.workEnd),
            tag: 0
          }
        }))
      }

      return schedule
    },
    getScheduleItem(state): CalendarEvent {
      return <CalendarEvent>this.getSchedule.at(<number>state.scheduleItemSelected)?.calendarEvent
    }
  },
  actions: {
    async createEvent(newEvent: CalendarEvent) {
      var schedule = this.getSchedule
      var startMins = (newEvent.startTime.hour * 60) + newEvent.startTime.minute
      var endMins = (newEvent.endTime.hour * 60) + newEvent.endTime.minute

      if (endMins > startMins) {
        if (schedule.find((value) => value.startMins <= startMins && value.endMins >= endMins && value.calendarEvent.tag == 0)) {
          if (this.calendarEvents.has(this.selectedDay.toString())) this.calendarEvents.get(this.selectedDay.toString()).push(newEvent)
          else this.calendarEvents.set(this.selectedDay.toString(), [newEvent])

          return { success: true } as IEventResponse;
        }
        else {
          return { success: false, message: 'Cannot create overlapping events.' } as IEventResponse
        }
      }
      else {
        return { success: false, message: 'Start time must be before end time.' } as IEventResponse
      }
    },
    async deleteEvent() {
      var dayEvents = this.calendarEvents.get(this.selectedDay.toString())
      var eventName = this.getScheduleItem.name
      if (this.getScheduleItem.tag == 0) {
        toast.add({ title: 'Cannot delete event', description: 'Cannot delete free time(would you really wanna do that?)', color: 'error', icon: 'mdi:delete' })
      }
      else if (dayEvents) {
        var index = dayEvents.findIndex((e) => e.startTime == this.getScheduleItem.startTime)
        
        if (index > -1) {
          dayEvents.splice(index, 1)

          if (this.scheduleItemSelected >= this.getSchedule.length) this.scheduleItemSelected--

          toast.add({ title: 'Deleted event', description: 'Deleted event ' + eventName, color: 'success', icon: 'mdi:delete' })
        }
      }
      else {
        toast.add({ title: 'Cannot delete event', description: 'Cannot delete recurring event: ' + eventName, color: 'error', icon: 'mdi:delete' })
      }
    }
  },
  persist: false,
  /*persist: {
    storage: piniaPluginPersistedstate.sessionStorage(),
  },*/
})

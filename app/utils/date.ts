import { today, getLocalTimeZone, toCalendarDateTime, Time, type DateDuration, type TimeDuration, type DateValue } from "@internationalized/date"

export const getToday = () => {
  return <DateValue>today(getLocalTimeZone())
}

export const getTimeFromToday = (days: number, hours: number, minutes: number) => {
  return toCalendarDateTime(getToday().add(<DateDuration>{ days: days }), new Time(hours, minutes))
}

export const getDurationNearestMinute = (endTime: Time, startTime: Time) => {
  var timeInMs = endTime.compare(startTime)
  var timeInMins = Math.round((timeInMs / 1000) / 60)

  return { hours: Math.floor(timeInMins / 60), minutes: timeInMins % 60 } as TimeDuration
}

export const addDuration = (d1: TimeDuration, d2: TimeDuration) => {
  var newMins = (d1.minutes ? d1.minutes : 0) + (d2.minutes ? d2.minutes : 0)
  var newHours = (d1.hours ? d1.hours : 0) + (d2.hours ? d2.hours : 0) + Math.floor(newMins / 60)

  return { hours: newHours, minutes: newMins % 60 } as TimeDuration
}

export const subtractDuration = (d1: TimeDuration, d2: TimeDuration) => {
  var minsTotal1 = (d1.minutes ? d1.minutes : 0) + (d1.hours ? d1.hours * 60 : 0)
  var minsTotal2 = (d2.minutes ? d2.minutes : 0) + (d2.hours ? d2.hours * 60 : 0)

  var minsDiff = minsTotal1 - minsTotal2

  return { hours: Math.floor(minsDiff / 60), minutes: minsDiff % 60 }
}

function pad(n: number) {
  return (n < 10) ? '0' + n.toString() : n.toString();
}

export const padTimeToString = (duration: TimeDuration) => {
  return pad(duration.hours ? duration.hours : 0) + ':' + pad(duration.minutes ? duration.minutes : 0)
}

export const timeToString = (time: Time) => {
  return padTimeToString({ hours: time.hour, minutes: time.minute })
}

export const toReadableString = (date: DateValue) => {
  return date.toDate(getLocalTimeZone()).toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
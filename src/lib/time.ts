import { Temporal } from 'temporal-polyfill'

export const now = () =>
  Temporal.Now.zonedDateTimeISO('Asia/Tokyo').toString({
    timeZoneName: 'never'
  })
// MM/dd
export const today = () =>
  Temporal.Now.plainDateISO('Asia/Tokyo').toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  })

// +09:00 ISO string
export const todayStart = () =>
  Temporal.Now.plainDateISO('Asia/Tokyo')
    .toZonedDateTime({ timeZone: 'Asia/Tokyo', plainTime: '00:00:00' })
    .toString({ timeZoneName: 'never' })

// +09:00 ISO string
export const todayEnd = () =>
  Temporal.Now.plainDateISO('Asia/Tokyo')
    .toZonedDateTime({ timeZone: 'Asia/Tokyo', plainTime: '23:59:59' })
    .toString({ timeZoneName: 'never' })

export const timeFormat = (datetimeStr: string, today?: string) => {
  const datetime = new Date(datetimeStr)
  const h = datetime.getHours().toString()
  const m = datetime.getMinutes().toString()
  if (today) {
    const isToday = datetime.toDateString() === new Date(today).toDateString()
    const date = isToday ? '' : `${today} `

    return isToday ? '' : `${date}${h}:${m}`
  }
  return `${h}:${m}`
}

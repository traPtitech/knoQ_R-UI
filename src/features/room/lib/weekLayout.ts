import { parseISO } from 'date-fns'
import type { RoomWithEvents } from '/@/features/room/types'

export const H_START = 9
export const H_END = 22
export const ROW_H = 52
export const GRID_H = (H_END - H_START) * ROW_H
// これより開始時間に差がないイベントはテキストが被らないように列を分けて表示する
const STACKING_START_THRESHOLD_MINUTES = 40

export type LaidOutRoom = {
  room: RoomWithEvents
  startMin: number
  endMin: number
  left: number
  right: number
  zIndex: number
}

const toMinOfDay = (iso: string): number => {
  const d = parseISO(iso)
  return d.getHours() * 60 + d.getMinutes()
}

/**
 * 時間が重なる items にレーンと重なり順を割り当てる。
 */
export const assignLanes = <T>(
  items: T[],
  startOf: (it: T) => number,
  endOf: (it: T) => number
): Array<T & { lane: number; lanes: number }> => {
  const sorted = [...items].sort(
    (a, b) => startOf(a) - startOf(b) || endOf(a) - endOf(b)
  )

  const out: Array<T & { lane: number; lanes: number }> = []
  let i = 0
  while (i < sorted.length) {
    const cluster = [sorted[i]]
    let maxEnd = endOf(sorted[i])
    let j = i + 1
    while (j < sorted.length && startOf(sorted[j]) < maxEnd) {
      cluster.push(sorted[j])
      maxEnd = Math.max(maxEnd, endOf(sorted[j]))
      j++
    }
    const laneEnd: number[] = []
    const laneOf: number[] = []
    cluster.forEach((it) => {
      let lane = laneEnd.findIndex((end) => end <= startOf(it))
      if (lane === -1) {
        lane = laneEnd.length
        laneEnd.push(endOf(it))
      } else {
        laneEnd[lane] = endOf(it)
      }
      laneOf.push(lane)
    })
    const lanes = laneEnd.length
    cluster.forEach((it, idx) => {
      out.push({ ...it, lane: laneOf[idx], lanes })
    })
    i = j
  }
  return out
}

export const assignLayouts = <T>(
  items: T[],
  startOf: (it: T) => number,
  endOf: (it: T) => number
): Array<T & { left: number; right: number; zIndex: number }> => {
  const sorted = [...items].sort(
    (a, b) => startOf(a) - startOf(b) || endOf(a) - endOf(b)
  )

  const out: Array<
    T & { left: number; right: number | undefined; zIndex: number }
  > = []
  for (const item of sorted) {
    const layout: T & {
      left: number
      right: number | undefined
      zIndex: number
    } = {
      ...item,
      left: 0,
      right: undefined,
      zIndex: 1
    }
    const overlapsInTime = (previous: (typeof out)[number]) =>
      startOf(item) < endOf(previous) && startOf(previous) < endOf(item)
    const overlapsInCalendar = () => out.filter(overlapsInTime)
    const overlapsInLane = () =>
      overlapsInCalendar().filter((previous) => previous.left === layout.left)

    let sameLaneOverlaps = overlapsInLane()
    while (sameLaneOverlaps.length > 0) {
      const recentOverlaps = sameLaneOverlaps.filter(
        (previous) =>
          startOf(item) - startOf(previous) < STACKING_START_THRESHOLD_MINUTES
      )
      if (recentOverlaps.length === 0) {
        layout.zIndex =
          Math.max(...overlapsInCalendar().map((previous) => previous.zIndex)) +
          1
        break
      }

      layout.left++
      sameLaneOverlaps.forEach((previous) => {
        previous.right = layout.left
      })
      sameLaneOverlaps = overlapsInLane()
    }
    const higherLaneOverlaps = out.filter(
      (previous) =>
        previous.left > layout.left &&
        startOf(item) - startOf(previous) >= STACKING_START_THRESHOLD_MINUTES &&
        overlapsInTime(previous)
    )
    if (higherLaneOverlaps.length > 0) {
      layout.right = Math.min(...higherLaneOverlaps.map((it) => it.left))
    }

    out.push(layout)
  }

  const finalRight = Math.max(0, ...out.map((layout) => layout.left)) + 1
  return out.map((layout) => ({
    ...layout,
    right: layout.right ?? finalRight
  }))
}

/**
 * 同一日内の rooms にレイアウトを割り当てる。
 */
export const layoutDay = (rooms: RoomWithEvents[]): LaidOutRoom[] => {
  const items = rooms.map((r) => ({
    room: r,
    startMin: toMinOfDay(r.timeStart),
    endMin: toMinOfDay(r.timeEnd)
  }))
  return assignLayouts(
    items,
    (it) => it.startMin,
    (it) => it.endMin
  )
}

export const minutesToTop = (min: number): number =>
  Math.max(0, ((min - H_START * 60) / 60) * ROW_H)

export const minutesToBottom = (min: number): number =>
  Math.min(GRID_H, ((min - H_START * 60) / 60) * ROW_H)

export const minutesOfDay = (iso: string): number => toMinOfDay(iso)

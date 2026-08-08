import { parseISO } from 'date-fns'
import type { RoomWithEvents } from '/@/features/room/types'

export const H_START = 9
export const H_END = 22
export const ROW_H = 52
export const GRID_H = (H_END - H_START) * ROW_H

export type LaidOutRoom = {
  room: RoomWithEvents
  startMin: number
  endMin: number
  lane: number
  lanes: number
}

const toMinOfDay = (iso: string): number => {
  const d = parseISO(iso)
  return d.getHours() * 60 + d.getMinutes()
}

/**
 * 時間区間を持つ items に対し、「時間が重なる cluster」単位で
 * lane (横並びの列) を割り当てる汎用ユーティリティ。
 * 同一 cluster 内で重ならない区間は同じ lane を再利用する。
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

/**
 * 同一日内の rooms に lane を割り当てる。
 */
export const layoutDay = (rooms: RoomWithEvents[]): LaidOutRoom[] => {
  const items = rooms.map((r) => ({
    room: r,
    startMin: toMinOfDay(r.timeStart),
    endMin: toMinOfDay(r.timeEnd)
  }))
  return assignLanes(
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

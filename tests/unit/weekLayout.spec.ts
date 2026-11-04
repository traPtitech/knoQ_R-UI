import { describe, expect, it } from 'vitest'
import { assignLayouts } from '/@/features/room/lib/weekLayout'

type Interval = {
  id: string
  start: number
  end: number
}

const layout = (items: Interval[]) =>
  assignLayouts(
    items,
    (item) => item.start,
    (item) => item.end
  )

describe('assignLayouts', () => {
  it('sorts items and uses one full-width lane when intervals do not overlap', () => {
    const input = [
      { id: 'later', start: 600, end: 660 },
      { id: 'earlier', start: 540, end: 600 }
    ]

    expect(layout(input)).toEqual([
      { id: 'earlier', start: 540, end: 600, left: 0, right: 1, zIndex: 1 },
      { id: 'later', start: 600, end: 660, left: 0, right: 1, zIndex: 1 }
    ])
    expect(input[0].id).toBe('later')
  })

  it('stacks overlapping items when the previous item started at least 20 minutes earlier', () => {
    expect(
      layout([
        { id: 'earlier', start: 540, end: 620 },
        { id: 'later', start: 560, end: 630 }
      ])
    ).toEqual([
      { id: 'earlier', start: 540, end: 620, left: 0, right: 1, zIndex: 1 },
      { id: 'later', start: 560, end: 630, left: 0, right: 1, zIndex: 2 }
    ])
  })

  it('moves recent overlaps right and narrows the earlier item', () => {
    expect(
      layout([
        { id: 'earlier', start: 540, end: 620 },
        { id: 'later', start: 559, end: 630 }
      ])
    ).toEqual([
      { id: 'earlier', start: 540, end: 620, left: 0, right: 1, zIndex: 1 },
      { id: 'later', start: 559, end: 630, left: 1, right: 2, zIndex: 1 }
    ])
  })

  it('keeps moving right until the new item has no recent same-lane overlaps', () => {
    expect(
      layout([
        { id: 'first', start: 540, end: 620 },
        { id: 'second', start: 545, end: 620 },
        { id: 'third', start: 550, end: 620 }
      ])
    ).toEqual([
      { id: 'first', start: 540, end: 620, left: 0, right: 1, zIndex: 1 },
      { id: 'second', start: 545, end: 620, left: 1, right: 2, zIndex: 1 },
      { id: 'third', start: 550, end: 620, left: 2, right: 3, zIndex: 1 }
    ])
  })

  it('stacks above the highest z-index among all overlapping items', () => {
    expect(
      layout([
        { id: 'first', start: 540, end: 620 },
        { id: 'second', start: 555, end: 620 },
        { id: 'third', start: 565, end: 620 },
        { id: 'fourth', start: 580, end: 620 }
      ])
    ).toEqual([
      { id: 'first', start: 540, end: 620, left: 0, right: 1, zIndex: 1 },
      { id: 'second', start: 555, end: 620, left: 1, right: 2, zIndex: 1 },
      { id: 'third', start: 565, end: 620, left: 0, right: 1, zIndex: 2 },
      { id: 'fourth', start: 580, end: 620, left: 1, right: 2, zIndex: 3 }
    ])
  })

  it('limits an item to the nearest higher lane when their overlap is old enough', () => {
    expect(
      layout([
        { id: 'first', start: 540, end: 580 },
        { id: 'second', start: 545, end: 610 },
        { id: 'third', start: 590, end: 620 }
      ])
    ).toEqual([
      { id: 'first', start: 540, end: 580, left: 0, right: 1, zIndex: 1 },
      { id: 'second', start: 545, end: 610, left: 1, right: 2, zIndex: 1 },
      { id: 'third', start: 590, end: 620, left: 0, right: 1, zIndex: 1 }
    ])
  })
})

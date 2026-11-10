import { describe, expect, test } from 'vitest'
import { createMessagePicker } from './messages'

describe('createMessagePicker', () => {
  test('shows every message once before any repeats', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    const pick = createMessagePicker(items)
    const firstRound = items.map(() => pick())
    expect([...firstRound].sort()).toEqual(items)
  })

  test('never shows the same message twice in a row across rounds', () => {
    const pick = createMessagePicker(['a', 'b', 'c'])
    let previous = pick()
    for (let i = 0; i < 200; i++) {
      const next = pick()
      expect(next).not.toBe(previous)
      previous = next
    }
  })

  test('works with a single message', () => {
    const pick = createMessagePicker(['only'])
    expect([pick(), pick()]).toEqual(['only', 'only'])
  })

  test('throws a clear error for an empty list', () => {
    expect(() => createMessagePicker([])).toThrow(/at least one message/)
  })
})

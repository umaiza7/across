/**
 * Returns a picker that hands out every message once, in a shuffled order,
 * before any message repeats, and never shows the same message twice in a row.
 */
export function createMessagePicker<T>(items: readonly T[], random: () => number = Math.random): () => T {
  if (items.length === 0) throw new Error('createMessagePicker needs at least one message')
  let bag: T[] = []
  let last: T | undefined

  const refill = (): T[] => {
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    if (shuffled.length > 1 && shuffled[shuffled.length - 1] === last) {
      ;[shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]]
    }
    return shuffled
  }

  return () => {
    if (bag.length === 0) bag = refill()
    const next = bag[bag.length - 1]
    bag = bag.slice(0, -1)
    last = next
    return next
  }
}

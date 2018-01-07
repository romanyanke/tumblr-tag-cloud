const { cachedToArray } = require('../lib/saveFiles')

describe('cachedToArray', () => {
  test('creates array', () => {
    const result = cachedToArray({ one: 1, two: 2 })
    expect(result).toEqual([{ tag: 'one', count: 1 }, { tag: 'two', count: 2 }])
  })

  test('sorts array', () => {
    const result = cachedToArray({ z: 1, a: 1, b: 1, y: 1 })
    expect(result).toEqual([
      { tag: 'a', count: 1 },
      { tag: 'b', count: 1 },
      { tag: 'y', count: 1 },
      { tag: 'z', count: 1 },
    ])
  })
})

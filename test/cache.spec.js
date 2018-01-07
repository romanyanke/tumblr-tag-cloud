const { updateCache } = require('../lib/cache')

describe('cache', () => {
  test('creates empty', () => {
    const updates = updateCache(
      {
        saved: 1,
        tags: ['one', 'two', 'two'],
      },
      {
        tags: {},
      },
    )

    expect(updates).toEqual({
      posts: 1,
      tags: { one: 1, two: 2 },
    })
  })

  test('updates existing', () => {
    const updates = updateCache(
      {
        saved: 2,
        tags: ['one', 'two'],
      },
      {
        tags: { two: 1, three: 3 },
      },
    )

    expect(updates).toEqual({
      posts: 2,
      tags: { one: 1, two: 2, three: 3 },
    })
  })

  test('updates any amount of existing', () => {
    const updates = updateCache(
      {
        saved: 3,
        tags: ['four', 'four'],
      },
      {
        tags: { four: 2 },
      },
    )

    expect(updates).toEqual({
      posts: 3,
      tags: { four: 4 },
    })
  })
})

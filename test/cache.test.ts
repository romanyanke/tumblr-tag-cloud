import { getNextRecordValue, processCache } from '../src/cache'

describe('getNextRecordValue', () => {
  it('should retrun next index', () => {
    expect(getNextRecordValue({ foo: 0 })).toEqual(1)
    expect(getNextRecordValue({ foo: 100 })).toEqual(101)
    expect(getNextRecordValue({ one: 1, two: 2 })).toEqual(3)
    expect(getNextRecordValue({ one: 1, two: 2, ten: 10 })).toEqual(11)
  })
  it('should retrun 0 if list is empty', () => {
    expect(getNextRecordValue({})).toEqual(0)
  })
})

describe('processCache', () => {
  it('it should create empty cache', () => {
    const cache = processCache()

    expect(cache.getCache()).toEqual({ posts: {}, tags: {} })
    expect(cache.countCachedPosts()).toEqual(0)
  })

  it('it should accept current cache', () => {
    const inputCache = { tags: { one: 1 }, posts: { id1: [1] } }
    const cache = processCache(inputCache)

    expect(cache.getCache()).toEqual(inputCache)
    expect(cache.countCachedPosts()).toEqual(1)
  })

  it('it should update cache', () => {
    const cache = processCache()

    cache.addPostTags({ id: 'post1', tags: ['one', 'two'] })
    expect(cache.getCache()).toEqual({ posts: { post1: [0, 1] }, tags: { one: 0, two: 1 } })

    cache.addPostTags({ id: 'post2', tags: ['two', 'three'] })
    expect(cache.getCache()).toEqual({
      posts: {
        post1: [0, 1],
        post2: [1, 2],
      },
      tags: { one: 0, two: 1, three: 2 },
    })

    cache.addPostTags({ id: 'post1', tags: ['one', 'two', 'three'] })
    expect(cache.getCache()).toEqual({
      posts: {
        post1: [0, 1, 2],
        post2: [1, 2],
      },
      tags: { one: 0, two: 1, three: 2 },
    })
  })
})

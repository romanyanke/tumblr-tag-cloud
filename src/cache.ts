import { CacheTags } from './interface'

const getEmptyCache = (): CacheTags => ({
  posts: {},
  tags: {},
})

export const getNextRecordValue = (record: Record<string, number>) => {
  const values = Object.values(record).sort((a, b) => a - b)
  const lastValue = values[values.length - 1]

  return typeof lastValue === 'number' ? lastValue + 1 : 0
}

export const processCache = (inputCache = getEmptyCache()) => {
  const cache = { ...getEmptyCache(), ...inputCache }
  const addPostTag = (postId: string, tag: string) => {
    if (typeof cache.tags[tag] === 'undefined') {
      cache.tags[tag] = getNextRecordValue(cache.tags)
    }

    const tagId = cache.tags[tag]
    cache.posts[postId].push(tagId)
  }

  const addPostTags = (post: { tags: string[]; id: string }) => {
    cache.posts[post.id] = []

    return post.tags.map(tag => addPostTag(post.id, tag))
  }

  const getCache = () => cache

  const countCachedPosts = () => (cache.posts ? Object.keys(cache.posts).length : 0)

  return {
    addPostTags,
    getCache,
    countCachedPosts,
  }
}

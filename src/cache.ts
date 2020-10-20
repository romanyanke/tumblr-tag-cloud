import { CacheTags } from './interface'

const getEmptyCache = (): CacheTags => ({
  posts: {},
  tags: {},
})

export const getNextRecordValue = (record: Record<string, number>) => {
  const values = Object.values(record).sort((a, b) => a - b)
  const lastValue = values[values.length - 1]

  return lastValue ? lastValue + 1 : 0
}

export const processCache = (inputCache = getEmptyCache()) => {
  const cache = { ...inputCache }
  const addPostTag = (postId: string, tag: string) => {
    if (!cache.tags[tag]) {
      cache.tags[tag] = getNextRecordValue(cache.tags)
    }

    if (!cache.posts[postId]) {
      cache.posts[postId] = []
    }

    const tagId = cache.tags[tag]
    cache.posts[postId].push(tagId)
  }

  const addTags = (post: { tags: string[]; id: string }) =>
    post.tags.map(tag => addPostTag(post.id, tag))

  const getCache = () => cache

  const countCachedPosts = () => Object.keys(cache.posts).length

  return {
    addTags,
    getCache,
    countCachedPosts,
  }
}

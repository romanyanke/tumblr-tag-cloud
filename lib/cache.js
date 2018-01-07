const { readCache } = require('./readJSON')
const cache = Object.assign(
  {
    posts: 0,
    tags: {},
  },
  readCache(),
)
const getCache = () => cache
const updateCache = (data, cache = getCache()) => {
  const { tags, saved } = data
  const cachedTags = Object.assign({}, cache.tags)

  tags.forEach(tag => {
    if (!cachedTags[tag]) {
      cachedTags[tag] = 0
    }

    cachedTags[tag] += 1
  })

  const update = {
    posts: saved,
    tags: cachedTags,
  }

  return update
}

module.exports = { getCache, updateCache }

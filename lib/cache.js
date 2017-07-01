const { readCache } = require('./readJSON')
const fs = require('fs')
const cachePath = require('./readJSON').paths.cache

const cache = Object.assign({
  posts: 0,
  tags: {}
}, readCache())

const getCache = () => cache

const updateCache = ({ tags, saved }) => {
  const cachedTags = cache.tags

  tags.forEach(tag => {
    if (!cachedTags[tag]) {
      cachedTags[tag] = 0
    }

    cachedTags[tag] += 1
  })

  const update = {
    posts: saved,
    tags: cachedTags
  }

  fs.writeFileSync(cachePath, JSON.stringify(update))

  return update
}

module.exports = { getCache, updateCache }

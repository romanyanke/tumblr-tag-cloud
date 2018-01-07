const fs = require('fs')
const path = require('path')
const config = require('./config')
const { updateCache } = require('./cache')
const paths = {
  dist: path.resolve(__dirname, '../dist'),
  cloudJSON: path.resolve(__dirname, '../dist/cloud.json'),
  cloudJSONP: path.resolve(__dirname, '../dist/cloud.js'),
  cache: path.resolve(__dirname, '../cache.json'),
}

if (!fs.existsSync(paths.dist)) {
  fs.mkdirSync(paths.dist)
}

const cachedToArray = tags => {
  const tagsArray = Object.keys(tags).map(tag => {
    return { tag, count: tags[tag] }
  })
  return tagsArray.sort((a, b) => a.tag.localeCompare(b.tag))
}

const writeFiles = data => {
  const updated = updateCache(data)
  const tagsArray = JSON.stringify(cachedToArray(updated.tags))

  fs.writeFileSync(paths.cache, JSON.stringify(updated))

  if (config.json) {
    fs.writeFileSync(paths.cloudJSON, tagsArray)
  }

  if (config.jsonp) {
    fs.writeFileSync(paths.cloudJSONP, config.jsonp + `(${tagsArray})`)
  }
}

module.exports = {
  cachedToArray,
  writeFiles,
}

const fs = require('fs')
const path = require('path')

const paths = {
  cache: path.resolve(__dirname, '../cache.json'),
  config: path.resolve(__dirname, '../tumblr-cloud.config.js'),
}

const readJSON = path => (fs.existsSync(path) ? require(path) : {})
const readConfig = () => readJSON(paths.config)
const readCache = () => readJSON(paths.cache)

module.exports = {
  paths,
  readJSON,
  readConfig,
  readCache,
}

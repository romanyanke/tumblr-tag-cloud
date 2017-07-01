const fs = require('fs')
const path = require('path')
const config = require('./config')

const paths = {
  dist: path.resolve(__dirname, '../dist'),
  cloudJSON: path.resolve(__dirname, '../dist/cloud.json'),
  cloudJSONP: path.resolve(__dirname, '../dist/cloud.js'),
  cache: path.resolve(__dirname, '../cache.json')
}

const mkdir = () => {
  if (!fs.existsSync(paths.dist)) {
    fs.mkdirSync(paths.dist)
  }
}

module.exports = data => {
  mkdir()

  const tagsArray = Object.keys(data.tags).map(tag => {
    return { tag, count: data.tags[tag] }
  })

  const dataText = JSON.stringify(tagsArray)
  if (config.json) {
    fs.writeFileSync(paths.cloudJSON, dataText)
  }
  if (config.jsonp) {
    fs.writeFileSync(paths.cloudJSONP, config.jsonp + `(${dataText})`)
  }
}

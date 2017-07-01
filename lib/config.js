const { readConfig } = require('./readJSON')

const configVariables = [
  'TUMBLR_CONSUMER_KEY',
  'TUMBLR_CONSUMER_SECRET',
  'TUMBLR_TOKEN',
  'TUMBLR_TOKEN_SECRET',
  'TUMBLR_BLOG'
]

const config = readConfig()

configVariables.forEach(variable => {
  if (!config[variable]) {
    if (!process.env[variable]) {
      console.error(`Invalid config. "${variable}" is not defined. See https://github.com/romanyanke/tumblr-tag-cloud#configuration for help.`)
      process.exit(0)
    }
    config[variable] = process.env[variable]
  }
})

module.exports = {
  consumer_key: config.TUMBLR_CONSUMER_KEY,
  consumer_secret: config.TUMBLR_CONSUMER_SECRET,
  token: config.TUMBLR_TOKEN,
  token_secret: config.TUMBLR_TOKEN_SECRET,
  blog: config.TUMBLR_BLOG,
  jsonp: config.TUMBLR_CALLBACK,
  json: !Boolean(config.TUMBLR_SKIP_JSON)
}

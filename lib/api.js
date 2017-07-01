const tumblr = require('tumblr.js')
const credentials = require('./config')
const { blog } = credentials

const client = tumblr.createClient({
  returnPromises: true,
  credentials
})

const blogInfo = client.blogInfo.bind(null, blog)
const blogPosts = opts => client.blogPosts.bind(null, blog, opts)

module.exports = {
  blogInfo,
  blogPosts
}

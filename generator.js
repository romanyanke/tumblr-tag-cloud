const path = require('path')
const fs = require('fs')
const tumblr = require('tumblr.js')
const client = tumblr.createClient({
  consumer_key: process.env.TUMBLR_CONSUMER_KEY,
  consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
  token: process.env.TUMBLR_TOKEN,
  token_secret: process.env.TUMBLR_TOKEN_SECRET
});
const tumbltBlogName = process.env.TUMBLR_BLOG
const jsonpCallback = process.env.TUMBLR_TAG_CALLBACK || 'buildTumblrTagCloud'

const step = 50
const paths = {
  cached: path.join(__dirname, '/cached.json'),
  tagCloud: path.join(__dirname, '/tag-cloud.js')
}

let cached = fs.existsSync(paths.cached) ? require(paths.cached) : {}
let iteration = 0
let cachedOffset = 0
let newTags = {}
if (cached.parsed) {
  cachedOffset = cached.parsed
  console.log(`parse with cached offset of ${cachedOffset}`);
}
let parsedPostsCount = cachedOffset

parseNextTags()

function parseNextTags() {
  console.log(`iteration ${iteration}`)

  client.blogPosts(tumbltBlogName, {
    limit: step,
    offset: cachedOffset + iteration * step
  }, function(err, resp) {

    if (err || !resp.posts) {
      console.log(err)
      console.log(`retry ${iteration}`)
      parseNextTags()
      return
    }

    if (resp.posts.length !== 0) {
      parsedPostsCount += resp.posts.length
      console.log(`parsed ${parsedPostsCount}/${resp.total_posts}`);

      resp.posts.forEach(post => {
        if (post.tags && post.tags.forEach) {
          post.tags.forEach(tag => {
            if (!newTags[tag]) {
              newTags[tag] = 0
            }
            newTags[tag] += 1
          })
        }
      })

      iteration++;
      parseNextTags()
    } else {
      let newCache = {
        parsed: parsedPostsCount,
        tags: {}
      }

      let cachedTags = cached.tags || {}
      Object.keys(newTags).forEach(tag => {
        if (cachedTags[tag]) {
          cachedTags[tag] = cachedTags[tag] + 1
        } else {
          cachedTags[tag] = newTags[tag]
        }
      })
      newCache.tags = cachedTags
      fs.writeFileSync(paths.cached, JSON.stringify(newCache))

      var tagCloud = Object.keys(cachedTags).map(tag => {
        let count = cachedTags[tag]
        return { tag, count }
      }).sort((a, b) => a.tag.localeCompare(b.tag))

      fs.writeFileSync(paths.tagCloud, jsonpCallback + '(' + JSON.stringify(tagCloud) + ')')

      console.log(`DONE! ${parsedPostsCount}/${resp.total_posts}`);

      process.exit(0)
    }
  });
}


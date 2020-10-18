const tumblr = require('tumblr.js')
const path = require('path')
const fs = require('fs')

const paths = {
  dist: path.resolve(__dirname, '../dist'),
  tmp: path.resolve(__dirname, '../tmp'),
  cache: path.resolve(__dirname, '../tmp/wip-cache.json'),
  config: path.resolve(__dirname, '../tumblr-cloud.config.js'),
}

const requiredFolders = [paths.dist, paths.tmp]
requiredFolders.forEach(path => {
  if (!fs.existsSync(paths.dist)) {
    fs.mkdirSync(paths.dist)
  }
})

const readJSON = path => (fs.existsSync(path) ? require(path) : {})
const cache = {
  postsParsed: 0,
  tags: [],
  ...readJSON(paths.cache),
}
console.log(cache)
const config = (savedConfig => {
  const requiredConfigVariables = [
    'TUMBLR_CONSUMER_KEY',
    'TUMBLR_CONSUMER_SECRET',
    'TUMBLR_TOKEN',
    'TUMBLR_TOKEN_SECRET',
    'TUMBLR_BLOG',
  ]

  requiredConfigVariables.forEach(variable => {
    if (!savedConfig[variable]) {
      if (!process.env[variable]) {
        console.error(
          `Invalid config. "${variable}" is not defined. See https://github.com/romanyanke/tumblr-tag-cloud#configuration for details.`,
        )
        process.exit(0)
      }
      savedConfig[variable] = process.env[variable]
    }
  })

  return savedConfig
})(readJSON(paths.config))

const client = tumblr.createClient({
  credentials: {
    consumer_key: config.TUMBLR_CONSUMER_KEY,
  },
  returnPromises: true,
})

const POSTS_PER_REQUEST = 50
const cachedPostsCount = cache.posts
let iteration = 0

function* generateRequest(requestsNeeded) {
  while (iteration < requestsNeeded) {
    yield makeRequest(iteration++)
  }
}
const makeRequest = i =>
  blogPosts({
    limit: POSTS_PER_REQUEST,
    offset: cachedPostsCount + i * POSTS_PER_REQUEST,
  })

const parseBlog = async () => {
  const totalPosts = await client.blogInfo(config.TUMBLR_BLOG).then(data => data.blog.total_posts)
  const requestsNeeded = Math.ceil((totalPosts - cachedPostsCount) / POSTS_PER_REQUEST)

  const request = generateRequest(requestsNeeded)
  let tags = []

  console.log(`
    ${totalPosts} post(s) found.
    ${cachedPostsCount} post(s) cached.
    Will send ${requestsNeeded} request(s).
  `)

  // while (true) {
  //   const next = request.next()

  //   if (next.done) {
  //     break
  //   }

  //   try {
  //     const data = await next.value()
  //     data.posts.forEach(post => (tags = tags.concat(post.tags)))
  //   } catch ({ message }) {
  //     throw {
  //       message,
  //       saved: cachedPostsCount + iteration * POSTS_PER_REQUEST,
  //       tags,
  //       total: totalPosts,
  //     }
  //   }
  // }

  return {
    saved: totalPosts,
    tags,
  }
}

parseBlog()
  .then(data => {
    console.log(`
    All ${data.saved} post(s) are parsed and saved.
  `)
    console.log(data)
    // writeFiles(data)
  })
  .catch(data => {
    console.error(`
    ${iteration} request(s) are succesfully sent.
    ${data.saved}/${data.total} post(s) parsed and saved.
    To continue parsing try agin later.
    Exit with error: "${data.message}"
  `)
    console.log(data)
    // writeFiles(data)
  })

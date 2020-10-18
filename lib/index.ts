import tumblr from 'tumblr.js'
import path, { resolve } from 'path'
import fs from 'fs'

const paths = {
  dist: path.resolve(__dirname, '../dist'),
  tmp: path.resolve(__dirname, '../tmp'),
  cache: path.resolve(__dirname, '../tmp/wip-cache.json'),
  config: path.resolve(__dirname, '../tumblr-cloud.config.js'),
}

const requiredFolders = [paths.dist, paths.tmp]
requiredFolders.forEach(path => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
})

const readJSON = (path: string) => (fs.existsSync(path) ? require(path) : {})
const cache = {
  postsParsed: 0,
  tags: [],
  ...readJSON(paths.cache),
}
const config = (savedConfig => {
  const requiredConfigVariables = [
    'TUMBLR_CONSUMER_KEY',
    // 'TUMBLR_CONSUMER_SECRET',
    // 'TUMBLR_TOKEN',
    // 'TUMBLR_TOKEN_SECRET',
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
  consumer_key: config.TUMBLR_CONSUMER_KEY,
})

const POSTS_PER_REQUEST = 50
const cachedPostsCount = cache.postsParsed
let iteration = 0

function* generateRequest(requestsNeeded: number) {
  while (iteration < requestsNeeded) {
    yield makeRequest(iteration, requestsNeeded)
  }
}

const makeRequest = (currentRequest: number, requestsNeeded: number) => {
  console.log(`Request ${currentRequest}/${requestsNeeded}`)

  return new Promise<any>((resolve, reject) => {
    client.blogPosts(
      config.TUMBLR_BLOG,
      {
        limit: POSTS_PER_REQUEST,
        offset: cachedPostsCount + currentRequest * POSTS_PER_REQUEST,
      },
      (err, data) => {
        if (err) {
          reject(err)
        }

        resolve(data)
      },
    )
  })
}

const countTotalBlogPost = () => {
  return new Promise<number>((resolve, reject) => {
    client.blogInfo(config.TUMBLR_BLOG, (err, data) => {
      if (err) {
        reject(err)
      }

      resolve(data.blog.total_posts)
    })
  })
}

const parseBlog = async () => {
  const totalPosts = await countTotalBlogPost()
  const requestsNeeded = 2 // Math.ceil((totalPosts - cachedPostsCount) / POSTS_PER_REQUEST)

  const request = generateRequest(requestsNeeded)
  let tags = []

  console.log(`
    ${totalPosts} post(s) found.
    ${cachedPostsCount} post(s) cached.
    Will send ${requestsNeeded} request(s).
  `)

  while (true) {
    try {
      const next = request.next()

      if (next.done) {
        break
      }

      const data = await next.value
      console.log({ data111: data })

      iteration++
      data.posts.forEach((post: { tags: any }) => (tags = tags.concat(post.tags)))
    } catch ({ message }) {
      throw {
        message,
        saved: cachedPostsCount + iteration * POSTS_PER_REQUEST,
        tags,
        total: totalPosts,
      }
    }
  }

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
  })
  .catch(data => {
    console.error(`
    ${iteration} request(s) are succesfully sent.
    ${data.saved}/${data.total} post(s) parsed and saved.
    To continue parsing try again later.
    Exit with error: "${data.message}"
  `)
    console.log(data)
  })

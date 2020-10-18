import tumblr from 'tumblr.js'
import path from 'path'
import fs from 'fs'
import { ConfigKeys, Config, Data, Cache } from './interface'
import { mapTagsToData, sumTagData } from './utils'

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

const readJSON = <T extends {}>(path: string): Partial<T> =>
  fs.existsSync(path) ? require(path) : {}

const storedCache: Cache = {
  done: false,
  postProcessed: 0,
  tags: [],
  ...readJSON<Cache>(paths.cache),
}
const config = (savedConfig => {
  const requiredConfigVariables: ConfigKeys[] = [ConfigKeys.blogName, ConfigKeys.consumerKey]

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

  return savedConfig as Config
})(readJSON<Config>(paths.config))

const client = tumblr.createClient({
  consumer_key: config.TUMBLR_CONSUMER_KEY,
})

const POSTS_PER_REQUEST = 50
const cachedPostsCount = storedCache.postProcessed
let iteration = 0

function* generateRequest(requestsNeeded: number) {
  while (iteration++ < requestsNeeded) {
    yield makeRequest(iteration, requestsNeeded)
  }
}

const makeRequest = (currentRequest: number, requestsNeeded: number) =>
  new Promise<string[]>((resolve, reject) => {
    console.log(`Request ${currentRequest}/${requestsNeeded}`)
    client.blogPosts(
      config.TUMBLR_BLOG,
      {
        limit: POSTS_PER_REQUEST,
        offset: cachedPostsCount + currentRequest * POSTS_PER_REQUEST,
      },
      (err, data: { posts: Array<{ tags: string[] }> }) => {
        if (err) {
          reject(err)
        }

        const tags = data.posts.reduce<string[]>((acc, post) => {
          return [...acc, ...post.tags]
        }, [])

        resolve(tags)
      },
    )
  })

const countTotalBlogPost = () =>
  new Promise<number>((resolve, reject) => {
    client.blogInfo(config.TUMBLR_BLOG, (err, data) => {
      if (err) {
        reject(err)
      }

      resolve(data.blog.total_posts)
    })
  })

const parseBlog = async (): Promise<Data> => {
  const totalPosts = await countTotalBlogPost()
  const requestsNeeded = 1 // Math.ceil((totalPosts - cachedPostsCount) / POSTS_PER_REQUEST)

  const request = generateRequest(requestsNeeded)
  let tags: string[] = []

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

      const newTags = await next.value
      tags = tags.concat(newTags)
    } catch ({ message }) {
      const data: Data = {
        done: false,
        iteration: iteration - 1,
        errorMessage: message,
        postProcessed: cachedPostsCount + iteration * POSTS_PER_REQUEST,
        tags,
        totalPosts,
      }

      throw data
    }
  }

  return {
    done: true,
    iteration,
    postProcessed: totalPosts,
    totalPosts,
    tags,
  }
}

const writeCacheToDisk = (data: Data) => {
  const cache: Cache = {
    done: data.done,
    postProcessed: data.postProcessed,
    tags: sumTagData(storedCache.tags, mapTagsToData(data.tags)),
  }

  fs.writeFileSync(paths.cache, JSON.stringify(cache), 'utf-8')
}

parseBlog()
  .then(data => {
    writeCacheToDisk(data)
    console.log(`
    All ${data.totalPosts} post(s) are parsed and saved.
  `)
  })
  .catch((data: Data) => {
    writeCacheToDisk(data)
    console.error(`
    ${iteration - 1} request(s) are succesfully sent.
    ${data.postProcessed}/${data.totalPosts} post(s) parsed and saved.
    To continue parsing try again later.
    Exit with error: "${data.errorMessage}"
  `)
  })

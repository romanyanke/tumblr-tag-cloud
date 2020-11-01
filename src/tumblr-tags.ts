import tumblr from 'tumblr.js'
import path from 'path'
import fs from 'fs'
import { Result, CacheTags, TumblrTagsOptions, TumblrPost } from './interface'
import { normalizePathName, readSafeJSON } from './utils'
import { processCache } from './cache'

export const parseTumblrPosts = ({
  outPath = 'dist',
  cachePath = 'tmp',
  blogName,
  consumerKey,
}: TumblrTagsOptions) => {
  if (!blogName || !consumerKey) {
    throw new Error('no `blogName` or `consumerKey` provided')
  }

  const paths = {
    cache: normalizePathName(path.resolve(__dirname, cachePath), 'cache.json'),
    dist: normalizePathName(path.resolve(__dirname, outPath), 'tags.json'),
  }

  const requiredFolders = [paths.cache, paths.dist]
  requiredFolders.forEach(path => {
    if (!fs.existsSync(path.dirname)) {
      fs.mkdirSync(path.dirname)
    }
  })

  const storedCache = processCache(readSafeJSON<CacheTags>(paths.cache.dirname))
  const client = tumblr.createClient({ consumer_key: consumerKey })
  const POSTS_PER_REQUEST = 50
  const cachedPostsCount = storedCache.countCachedPosts()
  let iteration = 0

  function* generateRequest(requestsNeeded: number) {
    while (iteration++ < requestsNeeded) {
      yield makeRequest(iteration, requestsNeeded)
    }
  }

  const makeRequest = (currentRequest: number, requestsNeeded: number) =>
    new Promise<TumblrPost[]>((resolve, reject) => {
      console.log(`Request ${currentRequest}/${requestsNeeded}`)
      client.blogPosts(
        blogName,
        {
          limit: POSTS_PER_REQUEST,
          offset: cachedPostsCount + currentRequest * POSTS_PER_REQUEST,
        },
        (err, data: { posts: TumblrPost[] }) => {
          if (err) {
            reject(err)
          }

          resolve(data.posts)
        },
      )
    })

  const countTotalBlogPost = () =>
    new Promise<number>((resolve, reject) => {
      client.blogInfo(blogName, (err, data) => {
        if (err) {
          reject(err)
        }

        resolve(data.blog.total_posts)
      })
    })

  const parseBlog = async (): Promise<Result> => {
    const totalPosts = await countTotalBlogPost()
    const requestsNeeded = Math.ceil((totalPosts - cachedPostsCount) / POSTS_PER_REQUEST)
    const request = generateRequest(requestsNeeded)

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
        const posts = await next.value
        posts.forEach(storedCache.addPostTags)
      } catch ({ message }) {
        const data: Result = {
          errorMessage: message,
          postProcessed: cachedPostsCount + iteration * POSTS_PER_REQUEST,
          totalPosts,
        }

        throw data
      }
    }

    return { postProcessed: totalPosts, totalPosts }
  }

  const writeDataToDisk = () => {
    const data = storedCache.getCache()

    fs.writeFileSync(paths.cache.path, JSON.stringify(data), 'utf-8')
  }

  process.on('SIGINT', () => {
    writeDataToDisk()
    process.exit()
  })

  return parseBlog()
    .then(data => {
      console.log(`
      All ${data.totalPosts} post(s) are parsed and saved.
  `)
    })
    .catch((data: Result) => {
      console.error(`
        ${iteration - 1} request(s) are succesfully sent.
        ${data.postProcessed}/${data.totalPosts} post(s) parsed and saved.
        To continue parsing try again later.
        Exit with error: "${data.errorMessage}"
  `)
    })
    .finally(() => {
      writeDataToDisk()
    })
}

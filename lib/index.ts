import tumblr from 'tumblr.js'
import path from 'path'
import fs from 'fs'
import { ConfigKeys, Config, Data, Cache, ParseOptions } from './interface'
import { mapTagsToData, normalizePathName, sumTagData } from './utils'

export const parse = ({
  outDir = 'dist',
  cacheDir = 'tmp',
  blogName,
  consumerKey,
}: ParseOptions) => {
  if (!blogName || !consumerKey) {
    throw new Error('no `blogName` or `consumerKey` provided')
  }

  const cache = normalizePathName(path.resolve(__dirname, cacheDir), 'cache.json')
  const dist = normalizePathName(path.resolve(__dirname, outDir), 'tags.json')
  const configPath = path.resolve(__dirname, '../tumblr-cloud.config.js')

  const requiredFolders = [cache, dist]
  requiredFolders.forEach(path => {
    if (!fs.existsSync(path.dirname)) {
      fs.mkdirSync(path.dirname)
    }
  })

  const readJSON = <T extends {}>(path: string): Partial<T> =>
    fs.existsSync(path) ? require(path) : {}

  const storedCache: Cache = {
    done: false,
    postProcessed: 0,
    tags: [],
    ...readJSON<Cache>(cache.dirname),
  }

  const client = tumblr.createClient({ consumer_key: consumerKey })
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
        blogName,
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
      client.blogInfo(blogName, (err, data) => {
        if (err) {
          reject(err)
        }

        resolve(data.blog.total_posts)
      })
    })

  const parseBlog = async (): Promise<Data> => {
    const totalPosts = await countTotalBlogPost()
    const requestsNeeded = Math.ceil((totalPosts - cachedPostsCount) / POSTS_PER_REQUEST)
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

  const getUpdatedTags = (tags: string[]) => sumTagData(storedCache.tags, mapTagsToData(tags))

  const writeCacheToDisk = (data: Data) => {
    const cacheData: Cache = {
      done: data.done,
      postProcessed: data.postProcessed,
      tags: getUpdatedTags(data.tags),
    }

    fs.writeFileSync(cache.path, JSON.stringify(cacheData), 'utf-8')
  }

  const writeDataToDisk = ({ tags }: Data) => {
    fs.writeFileSync(dist.path, JSON.stringify(getUpdatedTags(tags)), 'utf-8')
  }

  return parseBlog()
    .then(data => {
      writeCacheToDisk(data)
      writeDataToDisk(data)
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
}

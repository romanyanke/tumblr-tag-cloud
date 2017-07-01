const { updateCache } = require('./lib/cache')
const { blogPosts } = require('./lib/api')
const { getCache } = require('./lib/cache')
const countPosts = require('./lib/countPosts')
const saveFiles = require('./lib/saveFiles')
const bar = require('./lib/progressbar')

const POSTS_PER_REQUEST = 50
const cachedPostsCount = getCache().posts
let iteration = 0
let progress

function *generateRequest(requestsNeeded) {
  while (iteration < requestsNeeded) {
    progress.tick()
    yield request(iteration++)
  }
}
const request = i => blogPosts({
  limit: POSTS_PER_REQUEST,
  offset: cachedPostsCount + i * POSTS_PER_REQUEST
})

const parseBlog = async () => {
  const totalPosts = await countPosts()
  const requestsNeeded = Math.ceil((totalPosts - cachedPostsCount) / POSTS_PER_REQUEST)

  const request = await generateRequest(requestsNeeded)
  progress = bar(requestsNeeded)
  let tags = []

  console.log(`
    ${totalPosts} post(s) found.
    ${cachedPostsCount} post(s) cached.
    Will send ${requestsNeeded} request(s).
  `);

  while (true) {
    const next = request.next()

    if (next.done) {
      break
    }

    try {
      const data = await next.value()
      data.posts.forEach(post => tags = tags.concat(post.tags))
    } catch ({ message }) {
      throw {
        total: totalPosts,
        saved: cachedPostsCount + iteration * POSTS_PER_REQUEST,
        message,
        tags
      }
    }
  }

  return {
    saved: totalPosts,
    tags
  }
}


parseBlog().then(data => {
  console.log(`
    All ${data.saved} post(s) are parsed and saved.
  `);
  saveFiles(updateCache(data))
}).catch(data => {
  console.error(`
    ${iteration} request(s) are succesfully sent.
    ${data.saved}/${data.total} post(s) parsed and saved.
    To continue parsing try agin later.
    Exit with error: "${data.message}"
  `)
  saveFiles(updateCache(data))
})

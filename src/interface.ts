export interface Result {
  errorMessage?: string
  postProcessed: number
  totalPosts: number
}

export interface TumblrPost {
  id: string
  tags: string[]
}

export interface CacheTags {
  tags: Record<string, number>
  posts: Record<string, number[]>
}

export interface TumblrTagsOptions {
  config: TumblrTagsConfig
  requestedPostIds?: number[]
}

export interface TumblrTagsConfig {
  consumerKey: string
  blog: string
  cachePath?: string
  outPath?: string
}

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
  consumerKey: string
  blogName: string
  cachePath?: string
  outPath?: string
}

export interface TumblrTagsConfig {
  blog: string
  consumerKey: string
}

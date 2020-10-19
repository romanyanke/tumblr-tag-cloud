export interface Data {
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
  postProcessed: number
}

export interface ParseOptions {
  consumerKey: string
  blogName: string
  cachePath?: string
  outPath?: string
}

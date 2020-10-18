export enum ConfigKeys {
  consumerKey = 'TUMBLR_CONSUMER_KEY',
  blogName = 'TUMBLR_BLOG',
}

export type Config = Record<ConfigKeys, string>

export interface TagDataItem {
  tag: string
  count: number
}

export interface Data {
  done: boolean
  errorMessage?: string
  iteration: number
  postProcessed: number
  totalPosts: number
  tags: string[]
}

export interface Cache {
  done: boolean
  postProcessed: number
  tags: TagDataItem[]
}

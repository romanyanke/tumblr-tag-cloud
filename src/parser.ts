import { identity } from 'lodash'
import { CacheTags, ParsedTag, TumblrTagsParserOptions } from './interface'

export const reverseObject = (input: Record<string, any>): Record<string, string> => {
  const entries = Object.entries(input)

  return Object.fromEntries(entries.map(entry => entry.reverse()))
}

export const countItems = (input: string[]) => {
  return input.reduce<Record<string, number>>((acc, node) => {
    if (!acc[node]) {
      acc[node] = 0
    }
    acc[node]++

    return acc
  }, {})
}

export const parseTags = (cache: CacheTags, options: TumblrTagsParserOptions) => {
  const transform = options.transform || identity

  const tagsById = reverseObject(cache.tags)

  const allTags = Object.values(cache.posts)
    .reduce<number[]>((acc, tags) => [...acc, ...tags], [])
    .map(tagId => tagsById[tagId])
    .filter(Boolean)

  const tagsCount = countItems(allTags)
  const tags = Object.entries(tagsCount)
    .reduce<ParsedTag[]>((acc, [tag, count]) => [...acc, { tag, count }], [])
    .sort((a, b) => a.tag.localeCompare(b.tag))

  return transform(tags)
}

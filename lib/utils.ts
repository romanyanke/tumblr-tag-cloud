import path from 'path'
import { TagDataItem } from './interface'

export const mapTagsToData = (tags: string[]): TagDataItem[] => {
  const counters: Record<string, number> = {}

  tags.forEach(tag => {
    if (!counters[tag]) {
      counters[tag] = 0
    }

    counters[tag]++
  })

  const data = Object.entries(counters).map(([tag, count]) => {
    return { tag, count }
  })

  return data
}

export const mapTagDataToTags = (tagData: TagDataItem[]): string[] => {
  return tagData.reduce<string[]>((acc, item) => {
    for (let i = 0; i < item.count; i++) {
      acc.push(item.tag)
    }

    return acc
  }, [])
}

export const sumTagData = (data1: TagDataItem[], data2: TagDataItem[]) => {
  const tags1 = mapTagDataToTags(data1)
  const tags2 = mapTagDataToTags(data2)

  return mapTagsToData([...tags1, ...tags2])
}

export const normalizePathName = (pathname: string, fileNameFallback: string) => {
  const { ext, dir, base } = path.parse(pathname)
  const jsonExt = '.json'
  const isJSON = ext === jsonExt
  const filename = isJSON ? base : path.parse(fileNameFallback).name + jsonExt
  const dirname = isJSON ? dir : path.join(dir, base)

  return { dirname, filename, path: path.join(dirname, filename) }
}

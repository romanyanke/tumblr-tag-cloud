interface TagDataItem {
  tag: string
  count: number
}

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

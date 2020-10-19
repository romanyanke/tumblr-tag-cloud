import { mapTagDataToTags, mapTagsToData, normalizePathName, sumTagData } from '../lib/utils'

describe('mapTagsToData', () => {
  it('should count tags', () => {
    expect(mapTagsToData(['a', 'b'])).toEqual([
      { count: 1, tag: 'a' },
      { count: 1, tag: 'b' },
    ])

    expect(mapTagsToData(['a', 'a', 'a', 'b', 'b'])).toEqual([
      { count: 3, tag: 'a' },
      { count: 2, tag: 'b' },
    ])
  })
})

describe('mapTagDataToTags', () => {
  it('should return array of strings', () => {
    expect(mapTagDataToTags([{ count: 3, tag: 'a' }])).toEqual(['a', 'a', 'a'])
    expect(
      mapTagDataToTags([
        { count: 3, tag: 'a' },
        { count: 2, tag: 'b' },
      ]),
    ).toEqual(['a', 'a', 'a', 'b', 'b'])
  })
})

describe('sumTagData', () => {
  it('should sum couners', () => {
    expect(
      sumTagData(
        [{ count: 2, tag: 'a' }],
        [
          { count: 4, tag: 'a' },
          { count: 1, tag: 'b' },
        ],
      ),
    ).toEqual([
      { tag: 'a', count: 6 },
      { tag: 'b', count: 1 },
    ])
  })
})

describe('normalizePathName', () => {
  it('should return dir and filename', () => {
    expect(normalizePathName('./', 'file.json')).toEqual({
      dirname: '.',
      filename: 'file.json',
      path: 'file.json',
    })
    expect(normalizePathName('foo/bar/', 'file.json')).toEqual({
      dirname: 'foo/bar',
      filename: 'file.json',
      path: 'foo/bar/file.json',
    })
  })

  it('should use json file name from path', () => {
    expect(normalizePathName('./file.json', '')).toEqual({
      dirname: '.',
      filename: 'file.json',
      path: 'file.json',
    })
    expect(normalizePathName('foo/bar/file.json', '')).toEqual({
      dirname: 'foo/bar',
      filename: 'file.json',
      path: 'foo/bar/file.json',
    })
  })

  it('should use json file name from fallback', () => {
    expect(normalizePathName('bar', 'fallback.json')).toEqual({
      dirname: 'bar',
      filename: 'fallback.json',
      path: 'bar/fallback.json',
    })
    expect(normalizePathName('bar', 'fallback')).toEqual({
      dirname: 'bar',
      filename: 'fallback.json',
      path: 'bar/fallback.json',
    })
  })
})

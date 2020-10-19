import { normalizePathName } from '../src/utils'

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

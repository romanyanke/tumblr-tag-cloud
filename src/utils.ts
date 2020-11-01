import path from 'path'
import fs from 'fs'

export const readSafeJSON = <T extends {}>(path: string): T =>
  fs.existsSync(path) ? require(path) : {}

export const normalizePathName = (pathname: string, fileNameFallback: string) => {
  const { ext, dir, base } = path.parse(pathname)
  const jsonExt = '.json'
  const isJSON = ext === jsonExt
  const filename = isJSON ? base : path.parse(fileNameFallback).name + jsonExt
  const dirname = isJSON ? dir : path.join(dir, base)

  return { dirname, filename, path: path.join(dirname, filename) }
}

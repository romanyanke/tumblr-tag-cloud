import path from 'path'
import fs from 'fs'
import readPkgUp from 'read-pkg-up'

const upPackagePath = readPkgUp.sync()?.path
export const getParentModuleDir = () => {
  if (!upPackagePath) {
    throw new Error('parent module not found')
  }

  return path.parse(upPackagePath).dir
}

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

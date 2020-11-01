#! /usr/bin/env node
import yargs from 'yargs'
import { TumblrTagsConfig } from './interface'
import { readSafeJSON } from './utils'
import findConfig from 'find-config'

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection', reason)
})

process.on('uncaughtException', error => {
  console.error('Uncaught exception', error)
  process.exit(1)
})

const getConfig = (path: string) => {
  const configPath = findConfig(path)

  if (!configPath) {
    throw new Error(`Can't find config in "${path}"`)
  }

  const config = readSafeJSON<TumblrTagsConfig>(configPath)
  const requiredKeys: Array<keyof TumblrTagsConfig> = ['blog', 'consumerKey']

  requiredKeys.forEach(key => {
    if (!config[key]) {
      throw new Error(`Can't find "${key}" option in "${path}"`)
    }
  })

  return config
}

yargs
  .scriptName('ttags')
  .usage('$0 <cmd> [args]')

  .option('config', {
    alias: 'c',
    default: 'ttags.js',
    type: 'string',
    description: 'path to config file',
  })

  .command(
    'post [ids..]',
    'Parse specific posts',
    yargs => {
      yargs.options('ids', {
        type: 'array',
        describe: 'post id to process',
      })
    },
    argv => {
      // const config = getConfig(argv.config)
      console.log('parse', argv.ids, argv.config)
    },
  )

  .command(
    '$0',
    'Parse all posts',
    yargs => {},
    argv => {
      const config = getConfig(argv.config)
      console.log('get all data', config)
    },
  )

  .help().argv

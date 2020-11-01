#! /usr/bin/env node
import yargs from 'yargs'

process.on('unhandledRejection', reason => {
  console.error('Unhandled rejection', reason)
})

process.on('uncaughtException', error => {
  console.error('Uncaught exception', error)
  process.exit(1)
})

yargs
  .scriptName('ttags')
  .usage('$0 <cmd> [args]')

  .option('config', {
    alias: 'c',
    default: './ttags.js',
    type: 'string',
    description: 'path to config file',
  })

  .command(
    'post [ids..]',
    'Get data from post(s)',
    yargs => {
      yargs.options('ids', {
        type: 'array',
        describe: 'post id to process',
      })
    },
    argv => {
      console.log('parse', argv.ids, argv.config)
    },
  )

  .command(
    'generate',
    'Get all data',
    yargs => {},
    argv => {
      console.log('get all data', argv.config)
    },
  )

  .help().argv

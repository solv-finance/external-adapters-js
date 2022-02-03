import * as shell from 'shelljs'

import {
  allListDescription,
  compositeListDescription,
  sourceListDescription,
  targetListDescription,
} from './textAssets'

import { FileData } from './types'

const pathToComposites = 'packages/composites/'
const pathToSources = 'packages/sources/'
const pathToTargets = 'packages/targets/'

const getAdapterList = (list: string[], description: string): string => {
  return description + '\n\n## List\n\n' + list.join('\n') + '\n'
}

const getRedirectText = (path: string) => (name: string) => `- [${name}](${path}${name}/README.md)`

const saveText = (fileData: FileData[], stage: boolean): void => {
  for (const file of fileData) {
    shell.exec(`echo "${file.text}" > ${file.path}`, {
      fatal: true,
      silent: true,
    })

    if (stage)
      shell.exec(`git add ${file.path}`, {
        fatal: true,
        silent: true,
      })

    console.log(`${file.path} has been saved`)
  }
}

export const generateMasterList = (stage = false): void => {
  try {
    const compositeAdapters = shell
      .ls('-A', pathToComposites)
      .filter((name) => name !== 'README.md')
    const compositeRedirectList = compositeAdapters.map(getRedirectText('./'))
    const compositeAdapterText = getAdapterList(compositeRedirectList, compositeListDescription)

    const sourceAdapters = shell.ls('-A', pathToSources).filter((name) => name !== 'README.md')
    const sourceRedirectList = sourceAdapters.map(getRedirectText('./'))
    const sourceAdapterText = getAdapterList(sourceRedirectList, sourceListDescription)

    const targetAdapters = shell.ls('-A', pathToTargets).filter((name) => name !== 'README.md')
    const targetRedirectList = targetAdapters.map(getRedirectText('./'))
    const targetAdapterText = getAdapterList(targetRedirectList, targetListDescription)

    const allRedirectList = [
      ...compositeAdapters.map(getRedirectText('./' + pathToComposites)),
      ...sourceAdapters.map(getRedirectText('./' + pathToSources)),
      ...targetAdapters.map(getRedirectText('./' + pathToTargets)),
    ].sort()

    // TODO replace this one with full table
    const allAdapterText = getAdapterList(allRedirectList, allListDescription)

    saveText(
      [
        { path: pathToComposites + 'README.md', text: compositeAdapterText },
        { path: pathToSources + 'README.md', text: sourceAdapterText },
        { path: pathToTargets + 'README.md', text: targetAdapterText },
        { path: 'MASTERLIST.md', text: allAdapterText },
      ],
      stage,
    )
  } catch (error) {
    console.log({ error: error.message, stack: error.stack })
    throw Error(error)
  }
}

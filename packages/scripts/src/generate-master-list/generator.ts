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
  let shellString: shell.ShellString
  for (const file of fileData) {
    shellString = new shell.ShellString(file.text)
    shellString.to(file.path)

    if (stage) shell.exec(`git add ${file.path}`)

    console.log(`${file.path} has been saved`)
  }
}

export const generateMasterList = (stage = false): void => {
  shell.exec('git stash', {
    fatal: true,
    silent: true,
  })

  const compositeAdapters = shell.ls('-A', pathToComposites).filter((name) => name !== 'README.md')
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
  console.log({ allAdapterText })

  saveText(
    [
      { path: pathToComposites + 'README.md', text: compositeAdapterText },
      { path: pathToSources + 'README.md', text: sourceAdapterText },
      { path: pathToTargets + 'README.md', text: targetAdapterText },
      { path: 'MASTERLIST.md', text: allAdapterText },
    ],
    stage,
  )

  shell.exec('git stash pop', {
    fatal: true,
    silent: true,
  })
}

import * as shell from 'shelljs'

import {
  compositeListDescription,
  sourceListDescription,
  targetListDescription,
} from './textAssets'

import { FileData } from './types'

const pathToComposites = 'packages/composites/'
const pathToSources = 'packages/sources/'
const pathToTargets = 'packages/targets/'

const getAdapterList = (names: string[], description: string): string => {
  const list = names.map((name) => `- [${name}](./${name}/README.md)`).join('\n')
  return description + '\n\n## List\n\n' + list + '\n'
}

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
  const compositeAdapterText = getAdapterList(compositeAdapters, compositeListDescription)

  const sourceAdapters = shell.ls('-A', pathToSources).filter((name) => name !== 'README.md')
  const sourceAdapterText = getAdapterList(sourceAdapters, sourceListDescription)

  const targetAdapters = shell.ls('-A', pathToTargets).filter((name) => name !== 'README.md')
  const targetAdapterText = getAdapterList(targetAdapters, targetListDescription)

  saveText(
    [
      { path: pathToComposites + 'README.md', text: compositeAdapterText },
      { path: pathToSources + 'README.md', text: sourceAdapterText },
      { path: pathToTargets + 'README.md', text: targetAdapterText },
    ],
    stage,
  )

  shell.exec('git stash pop', {
    fatal: true,
    silent: true,
  })
}

import * as shell from 'shelljs'
import {
  compositeListDescription,
  sourceListDescription,
  targetListDescription,
} from './textAssets'
import { buildTable } from './table'
import { FileData, JsonObject, Package } from './types'

const pathToComposites = 'packages/composites/'
const pathToSources = 'packages/sources/'
const pathToTargets = 'packages/targets/'

const getAdapterList = (list: string[], description: string): string => {
  return description + '\n\n## List\n\n' + list.join('\n') + '\n'
}

const getRedirectText = (path: string) => (name: string) => `[${name}](${path}${name}/README.md)`

const getCompositeRedirect = getRedirectText(pathToComposites)
const getSourceRedirect = getRedirectText(pathToSources)
const getTargetRedirect = getRedirectText(pathToTargets)

const getGroupRedirect = (name: string) => `- [${name}](./${name}/README.md)`

const getJsonFile = (path: string): JsonObject => JSON.parse(shell.cat(path).toString())

const getVersion = (adapterPath: string) => {
  const packagePath = adapterPath + '/package.json'

  if (!shell.test('-f', packagePath)) return '`N/A`'

  const packageJson = getJsonFile(packagePath) as Package

  return `\`${packageJson.version}\`` ?? '`N/A`'
}

const sortText = (a: string, b: string) => {
  const capitalA = a.toUpperCase()
  const capitalB = b.toUpperCase()
  return capitalA > capitalB ? 1 : capitalA < capitalB ? -1 : 0
}

const saveText = (fileData: FileData[], stage: boolean): void => {
  for (const file of fileData) {
    const formattedText = file.text.replace(/`/g, '\\`')
    shell.exec(`echo "${formattedText}" > ${file.path}`, {
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
    const compositeRedirectList = compositeAdapters.map(getGroupRedirect)
    const compositeAdapterText = getAdapterList(compositeRedirectList, compositeListDescription)

    const sourceAdapters = shell.ls('-A', pathToSources).filter((name) => name !== 'README.md')
    const sourceRedirectList = sourceAdapters.map(getGroupRedirect)
    const sourceAdapterText = getAdapterList(sourceRedirectList, sourceListDescription)

    const targetAdapters = shell.ls('-A', pathToTargets).filter((name) => name !== 'README.md')
    const targetRedirectList = targetAdapters.map(getGroupRedirect)
    const targetAdapterText = getAdapterList(targetRedirectList, targetListDescription)

    // Fetch group-specific fields
    const allAdapters = [
      ...compositeAdapters.map((name) => ({
        name,
        type: '`composite`',
        path: pathToComposites + name,
        redirect: getCompositeRedirect(name),
      })),
      ...sourceAdapters.map((name) => ({
        name,
        type: '`source`',
        path: pathToSources + name,
        redirect: getSourceRedirect(name),
      })),
      ...targetAdapters.map((name) => ({
        name,
        type: '`target`',
        path: pathToTargets + name,
        redirect: getTargetRedirect(name),
      })),
    ].sort((a, b) => sortText(a.name, b.name))

    // Fetch general fields
    const allAdaptersTable = allAdapters.map((adapter) => {
      const version = getVersion(adapter.path)
      return [adapter.redirect, version, adapter.type]
    })

    const allAdapterText = buildTable(allAdaptersTable, ['Name', 'Version', 'Type'])

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

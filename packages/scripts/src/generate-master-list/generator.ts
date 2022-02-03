import * as shell from 'shelljs'
import {
  compositeListDescription,
  sourceListDescription,
  targetListDescription,
} from './textAssets'
import { buildTable } from './table'
import { EndpointDetails, FileData, JsonObject, Package, Schema } from './types'

const pathToComposites = 'packages/composites/'
const pathToSources = 'packages/sources/'
const pathToTargets = 'packages/targets/'

const localPathToRoot = '../../../../'

const wrapCode = (s: string | number = ''): string => `\`${s.toString()}\``

const getAdapterList = (list: string[], description: string): string => {
  return description + '\n\n## List\n\n' + list.join('\n') + '\n'
}

const getRedirectText = (path: string) => (name: string) => `[${name}](${path}${name}/README.md)`

const getCompositeRedirect = getRedirectText(pathToComposites)
const getSourceRedirect = getRedirectText(pathToSources)
const getTargetRedirect = getRedirectText(pathToTargets)

const getGroupRedirect = (name: string) => `- [${name}](./${name}/README.md)`

const getJsonFile = (path: string): JsonObject => JSON.parse(shell.cat(path).toString())

const getEndpoints = async (adapterPath: string) => {
  const indexPath = adapterPath + '/src/endpoint/index.ts'
  if (!shell.test('-f', indexPath)) return 'Unknown'

  const endpointDetails: EndpointDetails = await require(localPathToRoot + indexPath)

  const endpoints = Object.keys(endpointDetails)

  const allSupportedEndpoints = endpoints.reduce((list: string[], e) => {
    const supportedEndpoints = endpointDetails[e]?.supportedEndpoints ?? []
    list.push(...supportedEndpoints)
    return list
  }, [])

  if (!allSupportedEndpoints.length) return 'Unknown'

  return allSupportedEndpoints.sort().map(wrapCode).join(', ')
}

const getDefaultEndpoint = async (adapterPath: string) => {
  const configPath = adapterPath + '/src/config.ts'
  if (!shell.test('-f', configPath)) return 'Unknown'

  const config = await require(localPathToRoot + configPath)

  return config.DEFAULT_ENDPOINT ? wrapCode(config.DEFAULT_ENDPOINT) : 'Unknown'
}

const getEnvVars = (adapterPath: string) => {
  const schemaPath = adapterPath + '/schemas/env.json'
  if (!shell.test('-f', schemaPath)) return 'Unknown'

  const { properties = {}, required = [] } = getJsonFile(schemaPath) as Schema

  const envVars = Object.keys(properties)

  const formatted = envVars.sort().map((e) => wrapCode(e) + (required.includes(e) ? ' (✅)' : ''))

  return formatted.join(', ')
}

const getVersion = (adapterPath: string) => {
  const packagePath = adapterPath + '/package.json'
  if (!shell.test('-f', packagePath)) return 'Unknown'

  const packageJson = getJsonFile(packagePath) as Package

  return packageJson.version ? wrapCode(packageJson.version) : 'Unknown'
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

export const generateMasterList = async (stage = false): Promise<void> => {
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
    const allAdaptersTable = await Promise.all(
      allAdapters.map(async (adapter) => {
        const version = getVersion(adapter.path)
        const endpoints = await getEndpoints(adapter.path)
        const defaultEndpoint = await getDefaultEndpoint(adapter.path)
        const envVars = getEnvVars(adapter.path)
        /*TODO
        - API sources
        - License
        - WS Support
        - HTTP Support
        - Endpoint batching
        - Supported tests (integration, unit, e2e (link to each folder))
        - Other adapter dependencies from schema (link to other READMEs)
        - NAME (taken from src/index.ts, but lowercase, '_' => ' ' and capitalize first letter of each word)
        */
        return [adapter.redirect, version, adapter.type, envVars, endpoints, defaultEndpoint]
      }),
    )

    const allAdapterText = buildTable(allAdaptersTable, [
      'Name',
      'Version',
      'Type',
      'Environment Variables (✅ = required)',
      'Endpoints',
      'Default Endpoint',
    ])

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

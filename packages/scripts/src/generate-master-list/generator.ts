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
  return description + '\n\n## List\n\n' + list.join('\n')
}

const getRedirectText = (path: string) => (name: string) => `[${name}](${path}${name}/README.md)`

const getCompositeRedirect = getRedirectText(pathToComposites)
const getSourceRedirect = getRedirectText(pathToSources)
const getTargetRedirect = getRedirectText(pathToTargets)

const getGroupRedirect = (name: string) => `- [${name}](./${name}/README.md)`

const getJsonFile = (path: string): JsonObject => JSON.parse(shell.cat(path).toString())

const getEndpoints = async (adapterPath: string) => {
  let endpointsText = 'Unknown'
  let batchableEndpoints = 'Unknown'
  try {
    const indexPath = adapterPath + '/src/endpoint/index.ts'

    const endpointDetails: EndpointDetails = await require(localPathToRoot + indexPath)

    const endpoints = Object.keys(endpointDetails)

    const allSupportedEndpoints = endpoints.reduce((list: string[], e) => {
      const supportedEndpoints = endpointDetails[e].supportedEndpoints ?? []
      list.push(...supportedEndpoints)
      return list
    }, [])

    const allBatchableEndpoints = endpoints.filter((e) => endpointDetails[e].batchablePropertyPath)

    endpointsText = allSupportedEndpoints.length
      ? allSupportedEndpoints.sort().map(wrapCode).join(', ')
      : ''

    batchableEndpoints = allBatchableEndpoints.length
      ? allBatchableEndpoints.sort().map(wrapCode).join(', ')
      : ''

    return { endpointsText, batchableEndpoints }
  } catch (e) {
    // TODO add error logging when verbose
    return { endpointsText, batchableEndpoints }
  }
}

const getConfigDefaults = async (adapterPath: string) => {
  let defaultBaseUrl = 'Unknown'
  let defaultEndpoint = 'Unknown'
  try {
    const configPath = adapterPath + '/src/config.ts'

    const config = await require(localPathToRoot + configPath)

    if (config.DEFAULT_BASE_URL) defaultBaseUrl = wrapCode(config.DEFAULT_BASE_URL)
    if (config.DEFAULT_ENDPOINT) defaultEndpoint = wrapCode(config.DEFAULT_ENDPOINT)

    return { defaultBaseUrl, defaultEndpoint }
  } catch (e) {
    // TODO add error logging when verbose
    return { defaultBaseUrl, defaultEndpoint }
  }
}

const getEnvVars = (adapterPath: string) => {
  try {
    const schemaPath = adapterPath + '/schemas/env.json'

    const { properties = {}, required = [] } = getJsonFile(schemaPath) as Schema

    const envVarsList = Object.keys(properties)

    const formatted = envVarsList
      .sort()
      .map((e) => wrapCode(e) + (required.includes(e) ? ' (✅)' : ''))

    return formatted.join(', ')
  } catch (e) {
    // TODO add error logging when verbose
    return 'Unknown'
  }
}

const getTestSupport = (adapterPath: string) => {
  const pathToTests = adapterPath + '/test'
  return {
    e2e: shell.test('-d', pathToTests + '/e2e') ? '✅' : '',
    integration: shell.test('-d', pathToTests + '/integration') ? '✅' : '',
    unit: shell.test('-d', pathToTests + '/unit') ? '✅' : '',
  }
}

const getVersion = (adapterPath: string) => {
  let version = 'Unknown'
  try {
    const packagePath = adapterPath + '/package.json'
    const packageJson = getJsonFile(packagePath) as Package

    if (packageJson.version) version = wrapCode(packageJson.version)

    return version
  } catch (e) {
    // TODO add error logging when verbose
    return version
  }
}

const getWSSupport = async (adapterPath: string) => {
  try {
    const adapterFilePath = adapterPath + '/src/adapter.ts'

    const adapterFile = await require(localPathToRoot + adapterFilePath)

    return adapterFile.makeWSHandler ? '✅' : ''
  } catch (e) {
    // TODO add error logging when verbose
    return 'Unknown'
  }
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
        const { endpointsText, batchableEndpoints } = await getEndpoints(adapter.path)
        const { defaultBaseUrl, defaultEndpoint } = await getConfigDefaults(adapter.path)
        const envVars = getEnvVars(adapter.path)
        const wsSupport = await getWSSupport(adapter.path)
        const { e2e, integration, unit } = getTestSupport(adapter.path)
        /*TODO
        - License
        - HTTP Support
        - Supported tests (integration, unit, e2e (link to each folder))
        - Other adapter dependencies from schema (link to other READMEs)
        - NAME (taken from src/index.ts, but lowercase, '_' => ' ' and capitalize first letter of each word)
        */
        return [
          adapter.redirect,
          version,
          adapter.type,
          defaultBaseUrl,
          envVars,
          endpointsText,
          defaultEndpoint,
          batchableEndpoints,
          wsSupport,
          unit,
          integration,
          e2e,
        ]
      }),
    )

    const allAdapterText = buildTable(allAdaptersTable, [
      'Name',
      'Version',
      'Type',
      'Default API URL',
      'Environment Variables (✅ = required)',
      'Endpoints',
      'Default Endpoint',
      'Batchable Endpoints',
      'Supports WS',
      'Unit Tests',
      'Integration Tests',
      'End-to-End Tests',
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

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

const baseEaDependencies = [
  'ea',
  'ea-bootstrap',
  'ea-factories',
  'ea-reference-data-reader',
  'ea-test-helpers',
]

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

const getConfigDefaults = async (adapterPath: string, verbose = false) => {
  let defaultBaseUrl = 'Unknown'
  let defaultEndpoint = 'Unknown'
  try {
    const configPath = adapterPath + '/src/config.ts'

    const config = await require(localPathToRoot + configPath)

    if (config.DEFAULT_BASE_URL) defaultBaseUrl = wrapCode(config.DEFAULT_BASE_URL)
    if (config.DEFAULT_ENDPOINT) defaultEndpoint = wrapCode(config.DEFAULT_ENDPOINT)

    return { defaultBaseUrl, defaultEndpoint }
  } catch (error) {
    if (verbose) console.error({ error: error.message, stack: error.stack })
    return { defaultBaseUrl, defaultEndpoint }
  }
}

const getEndpoints = async (adapterPath: string, verbose = false) => {
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
  } catch (error) {
    if (verbose) console.error({ error: error.message, stack: error.stack })
    return { endpointsText, batchableEndpoints }
  }
}

const getEnvVars = (adapterPath: string, verbose = false) => {
  try {
    const schemaPath = adapterPath + '/schemas/env.json'

    const { properties = {}, required = [] } = getJsonFile(schemaPath) as Schema

    const envVarsList = Object.keys(properties)

    const formatted = envVarsList
      .sort()
      .map((e) => wrapCode(e) + (required.includes(e) ? ' (✅)' : ''))

    return formatted.join(', ')
  } catch (error) {
    if (verbose) console.error({ error: error.message, stack: error.stack })
    return 'Unknown'
  }
}

const getPackage = (adapterPath: string, verbose = false) => {
  let dependencies = 'Unknown'
  let version = 'Unknown'
  try {
    const packagePath = adapterPath + '/package.json'
    const packageJson = getJsonFile(packagePath) as Package

    if (packageJson.version) version = wrapCode(packageJson.version)

    if (packageJson.dependencies) {
      let dependencyList = Object.keys(packageJson.dependencies)

      dependencyList = dependencyList.reduce((list: string[], dep) => {
        const depSplit = dep.split('/')
        if (depSplit[0] === '@chainlink' && !baseEaDependencies.includes(depSplit[1]))
          list.push(wrapCode(depSplit[1]))
        return list
      }, [])

      dependencies = dependencyList.length ? dependencyList.sort().join(', ') : ''
    }

    return { dependencies, version }
  } catch (error) {
    if (verbose) console.error({ error: error.message, stack: error.stack })
    return { dependencies, version }
  }
}

const getTestSupport = (adapterPath: string) => {
  const pathToTests = adapterPath + '/test'
  const pathToE2E = pathToTests + '/e2e'
  const pathToIntegration = pathToTests + '/integration'
  const pathToUnit = pathToTests + '/unit'
  return {
    e2e: shell.test('-d', pathToE2E) ? `[✅](${pathToE2E})` : '',
    integration: shell.test('-d', pathToIntegration) ? `[✅](${pathToIntegration})` : '',
    unit: shell.test('-d', pathToUnit) ? `[✅](${pathToUnit})` : '',
  }
}

const getWSSupport = async (adapterPath: string, verbose = false) => {
  try {
    const adapterFilePath = adapterPath + '/src/adapter.ts'

    const adapterFile = await require(localPathToRoot + adapterFilePath)

    return adapterFile.makeWSHandler ? '✅' : ''
  } catch (error) {
    if (verbose) console.error({ error: error.message, stack: error.stack })
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

export const generateMasterList = async (stage = false, verbose = false): Promise<void> => {
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
        const { defaultBaseUrl, defaultEndpoint } = await getConfigDefaults(adapter.path, verbose)
        const { endpointsText, batchableEndpoints } = await getEndpoints(adapter.path, verbose)
        const envVars = getEnvVars(adapter.path, verbose)
        const { dependencies, version } = getPackage(adapter.path, verbose)
        const { e2e, integration, unit } = getTestSupport(adapter.path)
        const wsSupport = await getWSSupport(adapter.path, verbose)

        return [
          adapter.redirect,
          version,
          adapter.type,
          defaultBaseUrl,
          dependencies,
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
      'Dependencies',
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
    console.error({ error: error.message, stack: error.stack })
    throw Error(error)
  }
}

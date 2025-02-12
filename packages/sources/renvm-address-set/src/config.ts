import { util } from '@chainlink/ea-bootstrap'
import { Config } from '@chainlink/types'
import { RenNetwork } from '@renproject/interfaces'
import { isRenNetwork } from './ren'

export const NAME = 'RENVM'

export const DEFAULT_ENDPOINT = 'address'

export const ENV_NETWORK = 'NETWORK'
export const ENV_API_ENDPOINT = 'API_ENDPOINT'

export const DEFAULT_NETWORK = 'testnet'
export const DEFAULT_TOKEN_OR_CONTRACT = 'BTC'

export const makeConfig = (prefix?: string): Config => {
  const network = util.getEnv(ENV_NETWORK, prefix)
  if (network && !isRenNetwork(network)) throw Error(`Unknown Ren network: ${network}`)

  return {
    network: network as RenNetwork | undefined,
    defaultEndpoint: DEFAULT_ENDPOINT,
    api: {
      baseURL: util.getEnv(ENV_API_ENDPOINT, prefix),
    },
  }
}

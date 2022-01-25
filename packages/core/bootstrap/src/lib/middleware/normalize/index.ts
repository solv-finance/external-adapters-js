import type { Middleware, AdapterRequest, Config, APIEndpoint } from '../../types'
import { normalizeInput } from '../../modules'

/**
  Changes input parameters keys to a standard alias.

  e.g. given the following input parameter definition

    export const inputParameters: InputParameters = {

        base: {

            aliases: ['from', 'coin'],

            description: 'The symbol of the currency to query',

            required: true,

            type: 'string',
        },

    }

    Incoming `from` or `coin` keys would be renamed to `base`.
*/
export const withNormalizedInput: <C extends Config>(
  endpointSelector?: (request: AdapterRequest) => APIEndpoint<C>,
) => Middleware = (endpointSelector) => async (execute, context) => async (input: AdapterRequest) => {
  const normalizedInput = endpointSelector ? normalizeInput(input, endpointSelector(input)) : input
  return execute(normalizedInput, context)
}

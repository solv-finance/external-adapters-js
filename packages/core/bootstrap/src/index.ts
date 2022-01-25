import type types from './lib/types'
import { combineReducers, Store } from 'redux'
import { AdapterError, logger as Logger, HTTP, Validator, Builder } from './lib/modules'
import Cache from './lib/middleware/cache'
import * as metrics from './lib/metrics'
import * as RateLimit from './lib/middleware/rate-limit'
import * as burstLimit from './lib/middleware/burst-limit'
import * as cacheWarmer from './lib/middleware/cache-warmer'
import * as ws from './lib/middleware/ws'
import * as ioLogger from './lib/middleware/io-logger'
import * as statusCode from './lib/middleware/status-code'
import * as debug from './lib/middleware/debugger'
import * as normalize from './lib/middleware/normalize'
import * as server from './lib/server'
import { configureStore } from './lib/store'
import * as util from './lib/util'

const REDUX_MIDDLEWARE = ['burstLimit', 'cacheWarmer', 'rateLimit', 'ws'] as const
type ReduxMiddleware = typeof REDUX_MIDDLEWARE[number]

const rootReducer = combineReducers({
  burstLimit: burstLimit.reducer.rootReducer,
  cacheWarmer: cacheWarmer.reducer.rootReducer,
  rateLimit: RateLimit.reducer.rootReducer,
  ws: ws.reducer.rootReducer,
})

export type RootState = ReturnType<typeof rootReducer>

// Init store
const initState = { burstLimit: {}, cacheWarmer: {}, rateLimit: {}, ws: {} }
export const store = configureStore(rootReducer, initState, [
  cacheWarmer.epics.epicMiddleware,
  ws.epics.epicMiddleware,
])

// Run epics
cacheWarmer.epics.epicMiddleware.run(cacheWarmer.epics.rootEpic)
ws.epics.epicMiddleware.run(ws.epics.rootEpic)

export const storeSlice = (slice: ReduxMiddleware): Store =>
  ({
    getState: () => store.getState()[slice],
    dispatch: (a) => store.dispatch(a),
  } as Store)

export const makeMiddleware = <C extends types.Config>(
  execute: types.Execute,
  makeWsHandler?: types.MakeWSHandler,
  endpointSelector?: (request: types.AdapterRequest) => types.APIEndpoint<C>,
): types.Middleware[] => {
  const warmerMiddleware = [
    Cache.withCache(storeSlice('burstLimit')),
    RateLimit.withRateLimit(storeSlice('rateLimit')),
    statusCode.withStatusCode,
    normalize.withNormalizedInput(endpointSelector),
  ].concat(metrics.METRICS_ENABLED ? [metrics.withMetrics] : [])

  return [
    ioLogger.withIOLogger,
    Cache.withCache(storeSlice('burstLimit')),
    cacheWarmer.withCacheWarmer(storeSlice('cacheWarmer'), warmerMiddleware, {
      store: storeSlice('ws'),
      makeWSHandler: makeWsHandler,
    })(execute),
    ws.withWebSockets(storeSlice('ws'), makeWsHandler),
    RateLimit.withRateLimit(storeSlice('rateLimit')),
    statusCode.withStatusCode,
    normalize.withNormalizedInput(endpointSelector),
  ].concat(metrics.METRICS_ENABLED ? [metrics.withMetrics, debug.withDebug] : [debug.withDebug])
}

// Wrap raw Execute function with middleware
export const withMiddleware = async (
  execute: types.Execute,
  context: types.AdapterContext,
  middleware: types.Middleware[],
): Promise<types.Execute> => {
  // Init and wrap middleware one by one
  for (let i = 0; i < middleware.length; i++) {
    execute = await middleware[i](execute, context)
  }
  return execute
}

// Execution helper async => sync
export const executeSync: types.ExecuteSync = async (
  data: types.AdapterRequest,
  execute: types.Execute,
  context: types.AdapterContext,
  callback: types.Callback,
) => {
  try {
    const result = await execute(data, context)

    return callback(result.statusCode, result)
  } catch (error) {
    const feedID = metrics.util.getFeedId(data)
    return callback(
      error.statusCode || 500,
      HTTP.errored(data.id, error, error.providerResponseStatusCode || error.statusCode, feedID),
    )
  }
}

export const expose = <C extends types.Config>(
  name: string,
  execute: types.Execute,
  makeWsHandler?: types.MakeWSHandler,
  endpointSelector?: (request: types.AdapterRequest) => types.APIEndpoint<C>,
): types.ExecuteHandler => {
  const middleware = makeMiddleware(execute, makeWsHandler, endpointSelector)
  return {
    server: server.initHandler(name, execute, middleware),
  }
}

export { HTTP, Validator, AdapterError, Builder, Logger, util, server, Cache, RateLimit }

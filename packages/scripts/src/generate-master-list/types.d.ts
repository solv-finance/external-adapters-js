import { InputParameters } from '@chainlink/types'

export type FileData = {
  path: string
  text: string
}

export type EndpointDetails = {
  [endpointName: string]: {
    batchablePropertyPath?: { name: string }[]
    supportedEndpoints: string[]
    inputParameters: InputParameters
    description?: string
  }
}

export type EnvVars = {
  [envVar: string]: {
    default?: string | number
    description?: string
    options?: (string | number)[]
    type?: string
  }
}

export type JsonObject = { [key: string]: any }

export type MaxColChars = number[]

export type Package = {
  name?: string
  version?: string
}

export type Schema = {
  title?: string
  description?: string
  properties?: EnvVars
  required?: string[]
}

export type TableText = string[][]

export type TextRow = string[]

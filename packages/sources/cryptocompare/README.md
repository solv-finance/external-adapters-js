# Chainlink External Adapter for CryptoCompare

Version: 1.2.11

This README was generated automatically. Please see [scripts](../../scripts) for more info.

## Environment Variables

| Required? |  Name   |                                      Description                                       |  Type  | Options | Default |
| :-------: | :-----: | :------------------------------------------------------------------------------------: | :----: | :-----: | :-----: |
|    ✅     | API_KEY | An API key that can be obtained from [here](https://min-api.cryptocompare.com/pricing) | string |         |         |

---

## Input Parameters

| Required? |   Name   |     Description     |  Type  |                                                     Options                                                      | Default  |
| :-------: | :------: | :-----------------: | :----: | :--------------------------------------------------------------------------------------------------------------: | :------: |
|           | endpoint | The endpoint to use | string | [crypto](#crypto-endpoint), [marketcap](#crypto-endpoint), [price](#crypto-endpoint), [volume](#crypto-endpoint) | `crypto` |

---

## Crypto Endpoint

**NOTE: the `price` endpoint is temporarily still supported, however, is being deprecated. Please use the `crypto` endpoint instead.**

Supported names for this endpoint are: `crypto`, `marketcap`, `price`, `volume`.

### Input Params

| Required? | Name  |        Aliases         |               Description                | Type | Options | Default | Depends On | Not Valid With |
| :-------: | :---: | :--------------------: | :--------------------------------------: | :--: | :-----: | :-----: | :--------: | :------------: |
|    ✅     | base  | `coin`, `from`, `fsym` |   The symbol of the currency to query    |      |         |         |            |                |
|    ✅     | quote | `market`, `to`, `tsym` | The symbol of the currency to convert to |      |         |         |            |                |

### Example

Request:

```json
{
  "id": "1",
  "data": {
    "endpoint": "crypto",
    "resultPath": "PRICE",
    "base": "ETH",
    "quote": "BTC"
  }
}
```

Response:

```json
{
  "result": 0.06543
}
```

<details>
<summary>Additional Examples</summary>

Request:

```json
{
  "id": "1",
  "data": {
    "endpoint": "marketcap",
    "resultPath": "MKTCAP",
    "base": "ETH",
    "quote": "BTC"
  }
}
```

Response:

```json
{
  "result": 7694679.153236445
}
```

Request:

```json
{
  "id": "1",
  "data": {
    "endpoint": "volume",
    "resultPath": "VOLUME24HOURTO",
    "base": "ETH",
    "quote": "BTC"
  }
}
```

Response:

```json
{
  "result": 12999.111610148046
}
```

</details>

---

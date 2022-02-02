# Chainlink CoinPaprika External Adapter

Version: 1.2.0

_Note: the `-single` endpoints have the same functionality as their original endpoint, except they will only fetch data for the single asset being queried._

This README was generated automatically. Please see [scripts](../../scripts) for more info.

## Environment Variables

| Required? |     Name     | Description | Type | Options | Default |
| :-------: | :----------: | :---------: | :--: | :-----: | :-----: |
|           |   API_KEY    |             |      |         |         |
|           | IS_TEST_MODE |             |      |         |         |

---

## Input Parameters

| Required? |   Name   |     Description     |  Type  |                                                                                                          Options                                                                                                           | Default  |
| :-------: | :------: | :-----------------: | :----: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------: |
|           | endpoint | The endpoint to use | string | [coins](#coins-endpoint), [crypto](#crypto-endpoint), [dominance](#dominance-endpoint), [globalmarketcap](#globalmarketcap-endpoint), [marketcap](#crypto-endpoint), [price](#crypto-endpoint), [volume](#crypto-endpoint) | `crypto` |

---

## Crypto Endpoint

The `marketcap` endpoint fetches market cap of assets, the `volume` endpoint fetches 24-hour volume of assets, and the `crypto`/`price` endpoint fetches current price of asset pairs (https://api.coinpaprika.com/v1/tickers/`{COIN}`).

**NOTE: the `price` endpoint is temporarily still supported, however, is being deprecated. Please use the `crypto` endpoint instead.**

Supported names for this endpoint are: `crypto`, `marketcap`, `price`, `volume`.

### Input Params

| Required? |  Name  |    Aliases     |                   Description                    |  Type  | Options | Default | Depends On | Not Valid With |
| :-------: | :----: | :------------: | :----------------------------------------------: | :----: | :-----: | :-----: | :--------: | :------------: |
|    ✅     |  base  | `coin`, `from` |       The symbol of the currency to query        |        |         |         |            |                |
|    ✅     | quote  | `market`, `to` |     The symbol of the currency to convert to     |        |         |         |            |                |
|           | coinid |                | The coin ID (optional to use in place of `base`) | string |         |         |            |                |

### Example

Request:

```json
{
  "id": "1",
  "data": {
    "endpoint": "crypto",
    "resultPath": "price",
    "base": "ETH",
    "quote": "USD"
  }
}
```

Response:

```json
{
  "result": 3949.2425813062
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
    "resultPath": "market_cap",
    "base": "ETH",
    "quote": "USD"
  }
}
```

Response:

```json
{
  "result": 466143026900
}
```

Request:

```json
{
  "id": "1",
  "data": {
    "endpoint": "volume",
    "resultPath": "volume_24h",
    "base": "ETH",
    "quote": "USD"
  }
}
```

Response:

```json
{
  "result": 24136641726.138
}
```

</details>

---

## CryptoSingle Endpoint

There are no supported names for this endpoint.

### Input Params

| Required? |  Name  |    Aliases     |                   Description                    |  Type  | Options | Default | Depends On | Not Valid With |
| :-------: | :----: | :------------: | :----------------------------------------------: | :----: | :-----: | :-----: | :--------: | :------------: |
|    ✅     |  base  | `coin`, `from` |       The symbol of the currency to query        | string |         |         |            |                |
|    ✅     | quote  | `market`, `to` |     The symbol of the currency to convert to     | string |         |         |            |                |
|           | coinid |                | The coin ID (optional to use in place of `base`) | string |         |         |            |                |

### Example

There are no examples for this endpoint.

---

## Dominance Endpoint

Returns Bitcoin's dominance from the [global endpoint](https://api.coinpaprika.com/v1/global)

`dominance` is the only supported name for this endpoint.

### Input Params

| Required? |  Name  |    Aliases    |               Description                |  Type  | Options | Default | Depends On | Not Valid With |
| :-------: | :----: | :-----------: | :--------------------------------------: | :----: | :-----: | :-----: | :--------: | :------------: |
|    ✅     | market | `quote`, `to` | The symbol of the currency to convert to | string |         |         |            |                |

### Example

Request:

```json
{
  "id": "1",
  "data": {
    "endpoint": "dominance",
    "market": "BTC"
  }
}
```

Response:

```json
{
  "result": 44.68
}
```

---

## GlobalMarketcap Endpoint

Returns the global market capitilization from the [global endpoint](https://api.coinpaprika.com/v1/global)

`globalmarketcap` is the only supported name for this endpoint.

### Input Params

| Required? |  Name  |    Aliases    |               Description                |  Type  | Options | Default | Depends On | Not Valid With |
| :-------: | :----: | :-----------: | :--------------------------------------: | :----: | :-----: | :-----: | :--------: | :------------: |
|    ✅     | market | `quote`, `to` | The symbol of the currency to convert to | string |         |         |            |                |

### Example

Request:

```json
{
  "id": "1",
  "data": {
    "endpoint": "globalmarketcap",
    "market": "USD"
  }
}
```

Response:

```json
{
  "result": 2559344984924
}
```

---

## Coins Endpoint

`coins` is the only supported name for this endpoint.

### Input Params

There are no input parameters for this endpoint.

### Example

There are no examples for this endpoint.

---

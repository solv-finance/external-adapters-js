# Chainlink CoinPaprika External Adapter

### Environment Variables

| Required? |     Name     |                                                   Description                                                   | Options | Defaults to |
| :-------: | :----------: | :-------------------------------------------------------------------------------------------------------------: | :-----: | :---------: |
|           |   API_KEY    |                       An API key that can be obtained from the data provider's dashboard                        |         |             |
|           | IS_TEST_MODE | Whether or not the Coinpaprika API is running in testmode. This will be removed once their API is in production |         |             |

### Input Parameters

| Required? |   Name   |     Description     |                                                                                                                            Options                                                                                                                            | Defaults to |
| :-------: | :------: | :-----------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------: |
|           | endpoint | The endpoint to use | [crypto](#Crypto-Endpoint), [dominance](#Dominance-Endpoint), [globalmarketcap](#Global-Market-Capitalization-Endpoint), [marketcap](#Marketcap-Endpoint), [volume](#Volume-Endpoint), crypto-single, marketcap-single, [vwap or crypto-vwap](#Vwap-Endpoint) |  `crypto`   |

_Note: the `-single` endpoints have the same functionality as their original endpoint, except they will only fetch data for the single asset being queried._

---

## Crypto Endpoint

##### NOTE: the `price` endpoint is temporarily still supported, however, is being deprecated. Please use the `crypto` endpoint instead.

https://api.coinpaprika.com/v1/tickers/`{COIN}`

### Input Params

| Required? |          Name           |                        Description                        |                                       Options                                        | Defaults to |
| :-------: | :---------------------: | :-------------------------------------------------------: | :----------------------------------------------------------------------------------: | :---------: |
|    ✅     | `base`, `from`, `coin`  |            The symbol of the currency to query            |                                                                                      |             |
|    ✅     | `quote`, `to`, `market` |         The symbol of the currency to convert to          |                                                                                      |             |
|    🟡     |        `coinid`         |     The coin ID (optional to use in place of `base`)      |                                                                                      |             |
|    🟡     |       `overrides`       | If base provided is found in overrides, that will be used | [Format](../../core/bootstrap/src/lib/external-adapter/overrides/presetSymbols.json) |             |

### Sample Input

```json
{
  "id": "1",
  "data": {
    "base": "ETH",
    "quote": "USD"
  }
}
```

### Sample Output

```json
{
  "jobRunID": "278c97ffadb54a5bbb93cfec5f7b5503",
  "data": {
    "id": "eth-ethereum",
    "name": "Ethereum",
    "symbol": "ETH",
    "rank": 2,
    "circulating_supply": 109469522,
    "total_supply": 109469556,
    "max_supply": 0,
    "beta_value": 1.04048,
    "last_updated": "2020-01-28T21:56:03Z",
    "quotes": {
      "USD": {
        "price": 173.00001891,
        "volume_24h": 8256159044.3763,
        "volume_24h_change_24h": 2.54,
        "market_cap": 18938229376,
        "market_cap_change_24h": 0.93,
        "percent_change_1h": 0.27,
        "percent_change_12h": 1.04,
        "percent_change_24h": 0.92,
        "percent_change_7d": 2.18,
        "percent_change_30d": 27.49,
        "percent_change_1y": 64.2,
        "ath_price": 1432.88,
        "ath_date": "2018-01-13T21:04:00Z",
        "percent_from_price_ath": -87.93
      }
    },
    "result": 173.00001891
  },
  "result": 173.00001891,
  "statusCode": 200
}
```

## Dominance Endpoint

Returns Bitcoin's dominance from the [global endpoint](https://api.coinpaprika.com/v1/global)

### Input Params

| Required? |          Name           |             Description             | Options | Defaults to |
| :-------: | :---------------------: | :---------------------------------: | :-----: | :---------: |
|    ✅     | `quote`, `to`, `market` | The symbol of the currency to query |  `BTC`  |             |

### Sample Input

```json
{
  "id": "1",
  "data": {
    "endpoint": "dominance",
    "market": "BTC"
  }
}
```

### Sample Output

```json
{
  "jobRunID": "1",
  "data": {
    "market_cap_usd": 368198248292,
    "volume_24h_usd": 59351367068,
    "bitcoin_dominance_percentage": 59.98,
    "cryptocurrencies_number": 2435,
    "market_cap_ath_value": 835692000000,
    "market_cap_ath_date": "2018-01-07T11:17:00Z",
    "volume_24h_ath_value": 197699715619,
    "volume_24h_ath_date": "2020-03-13T10:00:00Z",
    "volume_24h_percent_from_ath": -69.98,
    "volume_24h_percent_to_ath": 233.1,
    "market_cap_change_24h": -0.2,
    "volume_24h_change_24h": 16.98,
    "last_updated": 1603238207,
    "result": 59.98
  },
  "result": 59.98,
  "statusCode": 200
}
```

## Global Market Capitalization Endpoint

Returns the global market capitilization from the [global endpoint](https://api.coinpaprika.com/v1/global)

### Input Params

| Required? |          Name           |             Description             | Options | Defaults to |
| :-------: | :---------------------: | :---------------------------------: | :-----: | :---------: |
|    ✅     | `quote`, `to`, `market` | The symbol of the currency to query |  `USD`  |             |

```json
{
  "id": "1",
  "data": {
    "endpoint": "globalmarketcap",
    "market": "USD"
  }
}
```

### Sample Output

```json
{
  "jobRunID": "1",
  "data": {
    "market_cap_usd": 368198248292,
    "volume_24h_usd": 59351367068,
    "bitcoin_dominance_percentage": 59.98,
    "cryptocurrencies_number": 2435,
    "market_cap_ath_value": 835692000000,
    "market_cap_ath_date": "2018-01-07T11:17:00Z",
    "volume_24h_ath_value": 197699715619,
    "volume_24h_ath_date": "2020-03-13T10:00:00Z",
    "volume_24h_percent_from_ath": -69.98,
    "volume_24h_percent_to_ath": 233.1,
    "market_cap_change_24h": -0.2,
    "volume_24h_change_24h": 16.98,
    "last_updated": 1603238207,
    "result": 368198248292
  },
  "result": 368198248292,
  "statusCode": 200
}
```

## Marketcap Endpoint

Fetch one or multiple market cap assets

### Input Params

| Required? |          Name           |                   Description                    | Options | Defaults to |
| :-------: | :---------------------: | :----------------------------------------------: | :-----: | :---------: |
|    ✅     | `base`, `from`, `coin`  |       The symbol of the currency to query        |         |             |
|    ✅     | `quote`, `to`, `market` |     The symbol of the currency to convert to     |         |             |
|           |        `coinid`         | The coin ID (optional to use in place of `base`) |         |             |

### Sample Input

```json
{
  "jobId": "1",
  "data": {
    "endpoint": "marketcap",
    "base": "ETH",
    "quote": "USD"
  }
}
```

### Sample Output

```json
{
  "jobRunID": "278c97ffadb54a5bbb93cfec5f7b5503",
  "data": {
    "id": "eth-ethereum",
    "name": "Ethereum",
    "symbol": "ETH",
    "rank": 2,
    "circulating_supply": 109469522,
    "total_supply": 109469556,
    "max_supply": 0,
    "beta_value": 1.04048,
    "last_updated": "2020-01-28T21:56:03Z",
    "quotes": {
      "USD": {
        "price": 173.00001891,
        "volume_24h": 8256159044.3763,
        "volume_24h_change_24h": 2.54,
        "market_cap": 18938229376,
        "market_cap_change_24h": 0.93,
        "percent_change_1h": 0.27,
        "percent_change_12h": 1.04,
        "percent_change_24h": 0.92,
        "percent_change_7d": 2.18,
        "percent_change_30d": 27.49,
        "percent_change_1y": 64.2,
        "ath_price": 1432.88,
        "ath_date": "2018-01-13T21:04:00Z",
        "percent_from_price_ath": -87.93
      }
    },
    "result": 173.00001891
  },
  "result": 173.00001891,
  "statusCode": 200
}
```

## Volume Endpoint

Fetch one or multiple assets for volume

### Input Params

| Required? |          Name           |                   Description                    | Options | Defaults to |
| :-------: | :---------------------: | :----------------------------------------------: | :-----: | :---------: |
|    ✅     | `base`, `from`, `coin`  |       The symbol of the currency to query        |         |             |
|    ✅     | `quote`, `to`, `market` |     The symbol of the currency to convert to     |         |             |
|           |        `coinid`         | The coin ID (optional to use in place of `base`) |         |             |

### Sample Input

```json
{
  "jobId": "1",
  "data": {
    "endpoint": "volume",
    "base": "ETH",
    "quote": "USD"
  }
}
```

### Sample Output

```json
{
  "jobRunID": "278c97ffadb54a5bbb93cfec5f7b5503",
  "data": {
    "id": "eth-ethereum",
    "name": "Ethereum",
    "symbol": "ETH",
    "rank": 2,
    "circulating_supply": 109469522,
    "total_supply": 109469556,
    "max_supply": 0,
    "beta_value": 1.04048,
    "last_updated": "2020-01-28T21:56:03Z",
    "quotes": {
      "USD": {
        "price": 173.00001891,
        "volume_24h": 8256159044.3763,
        "volume_24h_change_24h": 2.54,
        "market_cap": 18938229376,
        "market_cap_change_24h": 0.93,
        "percent_change_1h": 0.27,
        "percent_change_12h": 1.04,
        "percent_change_24h": 0.92,
        "percent_change_7d": 2.18,
        "percent_change_30d": 27.49,
        "percent_change_1y": 64.2,
        "ath_price": 1432.88,
        "ath_date": "2018-01-13T21:04:00Z",
        "percent_from_price_ath": -87.93
      }
    },
    "result": 8256159044.3763
  },
  "result": 8256159044.3763,
  "statusCode": 200
}
```

## Vwap Endpoint

Aliases: vwap, crypto-vwap

### Input Params

| Required? |          Name          |                   Description                    | Options | Defaults to |
| :-------: | :--------------------: | :----------------------------------------------: | :-----: | :---------: |
|    ✅     | `base`, `from`, `coin` |       The symbol of the currency to query        |         |             |
|    🟡     |        `coinid`        | The coin ID (optional to use in place of `base`) |         |             |
|           |        `hours`         |    Number of hours to calculate the VWAP for     |         |    `24`     |
|           |      `resultPath`      |               The value to return                |         |  `0.price`  |

### Sample Input

```json
{
  "id": "1",
  "data": {
    "base": "AMPL",
    "endpoint": "crypto-vwap"
  }
}
```

### Sample Output

```json
{
  "jobRunID": "1",
  "result": 0.949723,
  "providerStatusCode": 200,
  "statusCode": 200,
  "data": {
    "result": 0.949723
  }
}
```

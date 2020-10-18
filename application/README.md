# ID Application

A service which serves serial numbers for factories.

## Prerequisites

1. NodeJS LTS (12+)
1. Yarn

## Install

```console
yarn
```

## Starting server

```console
yarn start
```

### Parameters

The following **environment variables** can be used to configure the service:

* `PORT` to set on which port the service should run (default: 3000)

## API

| Method | URL      | Description      | Response             |
|:-------|:---------|:-----------------|:---------------------|
| `GET`  | `/id?factoryId&callback` | Request ID for a given factory | `{ }` |

* `factoryId`: `number`, the ID of the factory which is requesting the next sequence ID
* `callback`: `string`, the Base64 encoded URL to callback and send the ID to the factoryŁ

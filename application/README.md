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
| `GET`  | `/id` | Example API call | `{ hello: "world" }` |

### API for tests

| Method | URL      | Description    | Response |
|:-------|:---------|:---------------|:---------|
| `GET`  | `/db`    | Returns the DB | `{...}`  |
| `GET`  | `/clean` | Cleans the DB  | `{}`     |

## Docker

To build the image:

```console
docker build -t ts-service:latest .
```

### Run service

```console
docker run -d -p 3000:3000 ts-service:latest
```
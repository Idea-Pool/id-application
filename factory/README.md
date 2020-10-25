# factory

Fake factory service which produces laptops and can accept ID from the ID application

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

* `PORT` to set on which port the service should run (default: 3002)

## API

| Method | URL                          | Body                    | Description                         | Response         |
|:-------|:-----------------------------|:------------------------|:------------------------------------|:-----------------|
| `POST` | `/receive/:token/:sessionId` | `{ id: "seq123_123" }` | It receives the generated Serial ID | HTTP 200, `{id}` |

### Test API

The mock factory operates on Laptops. The following API can manage emulate the inner processes of the factory.

| Method   | URL                 | Body                                   | Description                                   | Response                          |
|:---------|:--------------------|:---------------------------------------|:----------------------------------------------|:----------------------------------|
| `PUT`    | `/_make`            | `{factoryId: number, baseUrl: string}` | Makes a new laptop                            | HTTP 201, `{<laptop>}`            |
| `POST`   | `/_timeout/:token`  | `{after: number, times: number}`       | Sets response for the given laptop to timeout | HTTP 201, `{<timeout-exception>}` |
| `POST`   | `/_fail/:token`     | `{status: number}`                     | Sets response for the given laptop to fail    | HTTP 201, `{<fail-exception>}`    |
| `GET`    | `/_requests/:token` | -                                      | Returns all requests received for the token   | HTTP 200/204, `{requests: [...]}` |
| `GET`    | `/_data`            | -                                      | Returns the DB                                | HTTP 200, `{...}`                 |
| `DELETE` | `/_data`            | -                                      | Cleans the DB                                 | HTTP 200, `{}`                    |

**IMPORTANT!** All controlling requests (test API) MUST include an `x-test-session-id` header to indicate the session, the data belongs to.

## Postman

For **testing the API** use Postman and the requests in the `Factory` folder of the [ID Application postman_collection.json](https://github.com/Idea-Pool/id-application/blob/main/postman/ID Application.postman_collection.json)

The postman collection contains the following folders:
1. `API` - this folder contains a request for each of the above-mentoned methods
1. `Self-test` - this folder contains implementation of the 3 use-cases (see [CASES.md](https://github.com/Idea-Pool/id-application/blob/main/factory/CASES.md)), only using the factory-mock, acting as E2E API test of the Factory mock itself
1. `Dev` - this folder contains implementation of the previous use cases, but using an up-and-running ID seqication. These tests can be used to test E2E the ID seqication and the use cases. In order to run these tests, the `applicationHost` environment variable must be set to the ID applicatio host.

**Important**, that these scenarios, after sending the ID request to the ID seqication, will wait until the ID seqication actually sends it back to the Factory (but at most 10 retries, 1 in every 10sec - to set these update `maxRetry` and `retryDelay` collection variables - after that the test will fail).

## Use cases

For **Use cases** see [CASES.md](https://github.com/Idea-Pool/id-application/blob/main/factory/CASES.md)
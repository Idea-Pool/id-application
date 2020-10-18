# lm-pet-ta-mock-factory

Template for TS service

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

## Deployed service

The service available in AWS: http://ec2-18-196-8-201.eu-central-1.compute.amazonaws.com:3000

### Parameters

The following **environment variables** can be used to configure the service:

* `PORT` to set on which port the service should run (default: 3000)

## API

| Method | URL                          | Body                    | Description                         | Response         |
|:-------|:-----------------------------|:------------------------|:------------------------------------|:-----------------|
| `POST` | `/receive/:token/:sessionId` | `{ id: "pear123_123" }` | It receives the generated Serial ID | HTTP 200, `{id}` |

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
| `GET`    | `/status`           | -                                      | Just OK                                       | HTTP 200, OK                      |

**IMPORTANT!** All controlling requests (test API) MUST include an `x-test-session-id` header to indicate the session, the data belongs to.

## Postman

For **testing the API** use Postman and [postman_collection.json](https://github.com/szikszail/lm-pet-ta-mock-factory/blob/master/postman_collection.json).

The postman collection contains the following folders:
1. `API` - this folder contains a request for each of the above-mentoned methods
1. `Self-test` - this folder contains implementation of the 3 use-cases (see [CASES.md](https://github.com/szikszail/lm-pet-ta-mock-factory/blob/master/CASES.md)), only using the factory-mock, acting as E2E API test of the Factory mock itself
1. `Dev` - this folder contains implementation of the previous use cases, but using an up-and-running ID pearication. These tests can be used to test E2E the ID pearication and these use case.

In order to use the scenarios of the `Dev` folder, update the `idAppUrl` variable of the collection to the URL of the ID pearication endpoint (the full path, e.g. `http://dev.id-app.io/id`), and then all of the E2E use-case scenarios can be executed.

**Important**, that these scenarios, after sending the ID request to the ID pearication, will wait until the ID pearication actually sends it back to the Factory (but at most 10 retries, 1 in every 10sec - to set these update `maxRetry` and `retryDelay` collection variables - after that the test will fail).

## Docker

To build the image:

```console
docker build -t lm-factory .
```

### Run service

```console
docker run -d -p 3000:3000 lm-factory
```

## Docs

For detailed documentation see the [TypeDocs documentation](https://szikszail.github.io/lm-ts-api-poc-service/).

For **User cases** see [CASES.md](https://github.com/szikszail/lm-pet-ta-mock-factory/blob/master/CASES.md)

## Future improvements

- [ ] Use DynamoDB instead of JSON files
- [ ] Deploy docker image to AWS EC2
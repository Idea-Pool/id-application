# Use-cases

For **testing these use-cases** use Postman and [postman_collection.json](https://github.com/Idea-Pool/id-application/blob/main/postman/ID Application.postman_collection.json).

## Positive

The **positive** use-case for the service:

1. A laptop is created (`/_make`)
1. A request for a new ID is sent (`/id/?factoryId&callback`)
1. The receive of the ID is awaited (`/_requests/:token`)
    1. The factory will reply with OK status to ID service (`/receive/:token` -> 200)

![01-positive](https://github.com/Idea-Pool/id-application/blob/main/factory/uml/01-positive.png?raw=true)

## Negative

Most **negative** use-cases can be also realized:

### Failed ID processing

1. A laptop is created (`/_make`)
1. Explicit failure is set for the laptop, e.g. label printing does not work, factory is down (`/_fail/:token` w/ `{status: 409}`)
1. A request for a new ID is sent (`/id/?factoryId&callback`)
1. The receive of the ID is awaited (`/_requests/:token`)
    1. The factory will reply with Failed status to ID service (`/receive/:token` -> 409)
    1. THEN The factory will reply with OK status to ID service (`/receive/:token` -> 200)

![02-negative-fail](https://github.com/Idea-Pool/id-application/blob/main/factory/uml/02-negative-fail.png?raw=true)

### ID processing timeout

1. A laptop is created (`/_make`)
1. Explicit timeout is set for the laptop, e.g. network down (`/_timeout/:token` w/ `{after: 10000, times: 4}`)
1. A request for a new ID is sent (`/id/?factoryId&callback`)
1. The receive of the ID is awaited (`/_requests/:token`)
    1. The factory will reply with Failed status to ID service (`/receive/:token` -> 408)
    1. THEN The factory will reply with OK status to ID service (`/receive/:token` -> 200)
    
![03-negative-timeout](https://github.com/Idea-Pool/id-application/blob/main/factory/uml/03-negative-timeout.png?raw=true)

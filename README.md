# wasp-event-service

Event service for `WASP`. Handles the storage and retrieval of events.

## Getting started

`wasp-event-service` can be run in a similar way to most nodejs applications. First install required dependencies using `npm`:

```sh
npm install
```

`wasp-event-service` depends on a `postgresql` database dependency and `Kafka` which can be brought locally up using docker:

```sh
docker-compose up -d
```

The database must be initialised with:

```sh
npx knex migrate:latest
```

And finally you can run the application in development mode with:

```sh
npm run dev
```

Or run tests with:

```sh
npm test
```


## Environment Variables

`wasp-event-service` is configured primarily using environment variables as follows:

| variable                        | required |       default        | description                                                                                         |
| :------------------------------ | :------: | :------------------: | :--------------------------------------------------------------------------------------------------:|
| LOG_LEVEL                       |    N     |       `info`         | Logging level. Valid values are [`trace`, `debug`, `info`, `warn`, `error`, `fatal`]                |
| PORT                            |    N     |        `80`          | Port on which the service will listen                                                               |
| DB_HOST                         |    Y     |         -            | Hostname for the db                                                                                 |
| DB_PORT                         |    N     |        5432          | Port to connect to the db                                                                           |
| DB_NAME                         |    N     |      `events`        | Name of the database to connect to                                                                  |
| DB_USERNAME                     |    Y     |         -            | Username to connect to the database with                                                            |
| DB_PASSWORD                     |    Y     |         -            | Password to connect to the database with                                                            |
| API_VERSION                     |    N     |`package.json version`| Package version of this service                                                                     |
| API_MAJOR_VERSION               |    N     |         `v1`         | Major version of this service                                                                       |
| API_OFFSET_LIMIT                |    N     |         100          | Maximum number of events returned by the API per response                                           |
| KAFKA_LOG_LEVEL                 |    N     |      `nothing`       | Log level to use for the Kafka connection. Choices are 'debug', 'info', 'warn', 'error' or 'nothing'|
| KAFKA_BROKERS                   |    N     |   `localhost:9092`   | Comma separated List of Kafka brokers to connect to                                                 |
| KAFKA_EVENTS_TOPIC              |    N     |      `events`        | Kafka topic to listen for new events on                                                             |
| KAFKA_EVENTS_NOTIFICATIONS_TOPIC|    N     |`event-notifications` | Outgoing Kafka topic for streaming events                                                           |


## Database structure
The structure of the database backing `wasp-event-service` can be found in [docs/db.md](./docs/db.md)

## Deploying WASP Event Service on WASP-Cluster with Helm/Kubernetes

### Install

```
brew install minikube helm
```

### WASP-Cluster

Obtain the `wasp-cluster` from the repo: `https://github.com/digicatapult/wasp-cluster.git`, and follow the readme instructions.

Eval is required to provide helm with visibility for your local docker image repository:

```
eval $(minikube docker-env)
```

Build the docker image:

```
docker build -t wasp-event-service .
```

To run/deploy the application on kubernetes via helm charts use the following values.yaml with the corresponding overrides:

```
helm install wasp-event-service helm/wasp-event-service
```
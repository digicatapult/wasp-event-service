# Database usage

`wasp-event-service` is backed by a PostgreSQL database and is the canonical record of the events that have been generated from sensor readings ingested on the `WASP` platform.

## Database migrations

Database migrations are handled using [`knex.js`](https://knexjs.org/) and can be migrated manually using the following commands:

```sh
npx knex migrate:latest # used to migrate to latest database version
npx knex migrate:up # used to migrate to the next database version
npx knex migrate:down # used to migrate to the previous database version
```

## Table structure

The following tables exist in the `events` database.

### `events`

`events` represent the list of generated `event` mechanisms for readings stored in `WASP`.

#### Columns

| column       | PostreSQL type            | nullable |       default        | description                                                   |
| :----------- | :------------------------ | :------- | :------------------: | :------------------------------------------------------------ |
| `id`         | `UUID`                    | FALSE    | `uuid_generate_v4()` | Unique identifier for the `event`                             |
| `thing_id`   | `UUID`                    | FALSE    |          -           | Identifier for the `thing` this event is associated with      |
| `type`       | `CHARACTER VARYING (50)`  | FALSE    |          -           | Type of metric the event measures (e.g. shock)                |
| `details`    | `JSONB`                   | FALSE    |     `{}::jsonb`      | Details for the event                                         |
| `timestamp`  | `Timestamp with timezone `| FALSE    |          -           | Timestamp for the event                                       |
| `created_at` | `Timestamp with timezone` | FALSE    |       `now()`        | When the row was first created                                |
| `updated_at` | `Timestamp with timezone` | FALSE    |       `now()`        | When the row was last updated                                 |

#### Indexes

| columns                     | Index Type | description                                                              |
| :-------------------------- | :--------- | :----------------------------------------------------------------------- |
| `uuid`                      | PRIMARY    | Primary key                                                              |
| `thing_id, timestamp`       | INDEX      | Allows quick filtering of `events` by `thing_id` and `timestamp`         |
| `thing_id, type, timestamp` | INDEX      | Allows quick filtering of `events` by `thing_id`, `type` and `timestamp` |

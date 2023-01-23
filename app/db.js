import knex from 'knex'

import env from './env.js'
const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = env

const client = knex({
  client: 'pg',
  migrations: {
    tableName: 'migrations',
  },
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
})

const addEvent = async ({ thingId, type, details, timestamp }) => {
  return client('events')
    .insert({ thing_id: thingId, type, timestamp, details })
    .returning(['id', 'thing_id AS thingId', 'type', 'details', 'timestamp'])
}

const findEventsByThingId = async ({
  thingId,
  offset,
  limit,
  type,
  sortByTimestamp,
  sortByType,
  startDate,
  endDate,
}) => {
  let query = client('events AS e')
    .select([
      'e.id AS id',
      'e.type AS type',
      'e.thing_id AS thingId',
      'e.details AS details',
      'e.timestamp AS timestamp',
    ])
    .where({ thing_id: thingId })
    .limit(limit)

  if (startDate) query = query.where('timestamp', '>=', startDate)
  if (endDate) query = query.where('timestamp', '<=', endDate)

  if (offset) query = query.offset(offset)

  if (type) {
    if (typeof type === 'string') {
      query = query.where('e.type', type)
    } else if (Array.isArray(type)) {
      query = query.whereIn('e.type', type)
    }
  }

  if (sortByType) {
    query = query.orderBy('e.type', sortByType)
  }

  query = query.orderBy('e.timestamp', sortByTimestamp)

  return query
}

const findEventByThingIdAndId = ({ thingId, eventId }) => {
  return client('events AS e')
    .select([
      'e.id AS id',
      'e.type AS type',
      'e.thing_id AS thingId',
      'e.details AS details',
      'e.timestamp AS timestamp',
    ])
    .where({ thing_id: thingId, id: eventId })
}

const updateEvent = async ({ thingId, eventId, details }) => {
  return client('events')
    .update({ details })
    .returning(['id', 'thing_id AS thingId', 'type', 'details', 'timestamp'])
    .where({ thing_id: thingId, id: eventId })
}

export { client, addEvent, findEventsByThingId, findEventByThingIdAndId, updateEvent }

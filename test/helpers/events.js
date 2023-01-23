import delay from 'delay'
import env from '../../app/env.js'
import { getProducer } from './kafka.js'

const { KAFKA_EVENTS_TOPIC } = env

const getEventCount = async (context) => {
  const eventCountArr = await context.db('events').count()
  return parseInt(eventCountArr[0].count)
}

const publishEventAndWait = async (context, { thingId, type, details, timestamp }) => {
  const initEventCount = await getEventCount(context)

  await getProducer().send({
    topic: KAFKA_EVENTS_TOPIC,
    messages: [
      {
        key: thingId,
        value: JSON.stringify({
          thingId,
          type,
          details,
          timestamp,
        }),
      },
    ],
  })

  for (let i = 0; i < 10; i++) {
    const count = await getEventCount(context)

    if (count - initEventCount === 1) {
      return
    } else {
      await delay(100)
    }
  }

  throw new Error('Timeout waiting for event count in db to increase')
}

const getEvents = (context) => context.db('events')

function createEvent({ altThingId, thingId, type, details, timestamp }) {
  return {
    thingId: altThingId || thingId,
    type: type || 'eventTypeOne',
    timestamp: timestamp || new Date().toISOString(),
    details: details || {},
  }
}

function createEvents({ date, type, thingId, total }) {
  const events = []

  for (let counter = 0; counter < total; counter++) {
    const timestamp = date.add(2, 'minutes').toISOString()
    const event = createEvent({
      altThingId: null,
      thingId,
      type: type || `eventType-${Math.round(Math.random() * (total - 1) + 1)}`,
      details: {
        message: `Event details #${counter}`,
      },
      timestamp,
    })

    events.push(event)
  }

  return events
}

const eventSortByAscTimestampSortFn = (a, b) => {
  if (a.timestamp < b.timestamp) {
    return -1
  } else {
    return 1
  }
}

const sortEventsByAscTimestamp = (events) => {
  return events.sort(eventSortByAscTimestampSortFn)
}

const eventSortByAscTypeAndAscTimestampFn = (a, b) => {
  if (a.type < b.type) {
    return -1
  } else if (a.timestamp > b.timestamp) {
    return 1
  } else {
    if (a.timestamp > b.timestamp) {
      return -1
    } else {
      return 1
    }
  }
}

const sortEventsByAscTypeAndAscTimestamp = (events) => {
  return events.sort(eventSortByAscTypeAndAscTimestampFn)
}

const eventSortByDescTypeAndAscTimestampFn = (a, b) => {
  if (a.type > b.type) {
    return -1
  } else if (a.timestamp > b.timestamp) {
    return 1
  } else {
    if (a.timestamp > b.timestamp) {
      return -1
    } else {
      return 1
    }
  }
}

const sortEventsByDescTypeAndAscTimestamp = (events) => {
  return events.sort(eventSortByDescTypeAndAscTimestampFn)
}

export {
  publishEventAndWait,
  getEvents,
  createEvent,
  createEvents,
  sortEventsByAscTimestamp,
  sortEventsByAscTypeAndAscTimestamp,
  sortEventsByDescTypeAndAscTimestamp,
}

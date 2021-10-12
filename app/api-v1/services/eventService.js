const { findEventsByThingId, findEventByThingIdAndId, addEvent, updateEvent } = require('../../db')

async function getEventByThingIdAndId({ thingId, eventId }) {
  const result = await findEventByThingIdAndId({ thingId, eventId })

  if (result.length === 0) {
    return { statusCode: 404, result: {} }
  } else {
    return { statusCode: 200, result: result[0] }
  }
}

async function getEventsByThingId(requestResult) {
  const result = await findEventsByThingId(requestResult)

  return {
    statusCode: 200,
    result,
  }
}

async function postEvent({ thingId, type, timestamp, details }) {
  const createdResult = await addEvent({ thingId, type, details, timestamp })

  const result = createdResult.length === 1 ? createdResult[0] : {}

  return { statusCode: 201, result }
}

async function putEvent({ thingId, eventId, details }) {
  const resultEvent = await findEventByThingIdAndId({ thingId, eventId })
  if (resultEvent.length === 0) {
    return { statusCode: 404, result: {} }
  }

  const updatedEvent = await updateEvent({ thingId, eventId, details })

  return { statusCode: 200, result: updatedEvent[0] }
}

module.exports = {
  getEventByThingIdAndId,
  getEventsByThingId,
  postEvent,
  putEvent,
}

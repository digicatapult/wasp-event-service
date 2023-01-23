import { describe, before, it } from 'mocha'
import { expect } from 'chai'
import moment from 'moment'
import delay from 'delay'

import { setupServer } from './helpers/server.js'
import { setupDb } from './helpers/db.js'
import env from '../app/env.js'
import {
  createEvent,
  createEvents,
  sortEventsByAscTimestamp,
  sortEventsByAscTypeAndAscTimestamp,
  sortEventsByDescTypeAndAscTimestamp,
} from './helpers/events.js'

const { API_OFFSET_LIMIT } = env

describe('Events', function () {
  const context = {}

  let date
  let thingId
  let event

  setupServer(context)
  setupDb(context)

  before(function () {
    date = moment().subtract(1, 'month').startOf('day')
    thingId = 'ee4b3481-ce8d-43a6-a8f1-8a8e2fbeb242'
  })

  describe('GET events with paging and default DESC timestamp sort', function () {
    before(async function () {
      await context.db('events').del()

      const events = createEvents({ date, thingId, total: 102 })

      events.forEach(async (event) => {
        await context.request.post(`/v1/thing/${thingId}/event`).send(event)
      })
      await delay(100)
    })

    it(`should return 200 with implicit default limit = ${API_OFFSET_LIMIT}`, async function () {
      context.response = await context.request.get(`/v1/thing/${thingId}/event`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(100)
    })

    it(`should return 200 with limit - 1 = ${API_OFFSET_LIMIT - 1}`, async function () {
      let offset = API_OFFSET_LIMIT - 1
      context.response = await context.request.get(`/v1/thing/${thingId}/event/?offset=${offset}`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(3)
    })

    it(`should return 200 with explicit default limit = ${API_OFFSET_LIMIT}`, async function () {
      const offset = API_OFFSET_LIMIT
      context.response = await context.request.get(`/v1/thing/${thingId}/event/?offset=${offset}`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(2)
    })

    it(`should return 200 with limit = ${API_OFFSET_LIMIT + 2}`, async function () {
      const offset = API_OFFSET_LIMIT + 2
      context.response = await context.request.get(`/v1/thing/${thingId}/event/?offset=${offset}`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(0)
    })

    it(`should return 200 with limit = ${API_OFFSET_LIMIT / 2} with valid override`, async function () {
      const limit = API_OFFSET_LIMIT / 2
      context.response = await context.request.get(`/v1/thing/${thingId}/event/?&limit=${limit}`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(limit)
    })

    it(`should return 200 with limit = ${API_OFFSET_LIMIT} with invalid override and fallback to env default`, async function () {
      const limit = 102
      context.response = await context.request.get(`/v1/thing/${thingId}/event/?&limit=${limit}`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(API_OFFSET_LIMIT)
    })
  })

  describe('GET events with sorting', function () {
    let events
    let eventsTail

    before(async function () {
      await context.db('events').del()

      events = createEvents({ date, thingId, total: 30 })
      eventsTail = events.length - 1

      events.forEach(async (event) => {
        await context.request.post(`/v1/thing/${thingId}/event`).send(event)
      })
      await delay(100)
    })

    it('should return 200 with implicit default ASC timestamp sorting', async function () {
      context.response = await context.request.get(`/v1/thing/${thingId}/event`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(events.length)
      expect(context.response.body[0].timestamp).to.equal(events[0].timestamp)
      expect(context.response.body[0].type).to.equal(events[0].type)
      expect(context.response.body[eventsTail].timestamp).to.equal(events[eventsTail].timestamp)
      expect(context.response.body[eventsTail].type).to.equal(events[eventsTail].type)
    })

    it('should return 200 with explicit ASC timestamp sorting', async function () {
      const sortByTimestamp = 'asc'

      context.response = await context.request.get(`/v1/thing/${thingId}/event/?sortByTimestamp=${sortByTimestamp}`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(events.length)
      expect(context.response.body[0].timestamp).to.equal(events[0].timestamp)
      expect(context.response.body[0].type).to.equal(events[0].type)
      expect(context.response.body[eventsTail].timestamp).to.equal(events[eventsTail].timestamp)
      expect(context.response.body[eventsTail].type).to.equal(events[eventsTail].type)
    })

    it('should return 200 with DESC timestamp sorting', async function () {
      const sortByTimestamp = 'desc'

      let eventsCopy = events.map((event) => event)
      eventsCopy = sortEventsByAscTimestamp(eventsCopy)
      eventsCopy.reverse()

      context.response = await context.request.get(`/v1/thing/${thingId}/event/?sortByTimestamp=${sortByTimestamp}`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(eventsCopy.length)
      expect(context.response.body[0].timestamp).to.equal(eventsCopy[0].timestamp)
      expect(context.response.body[eventsTail].timestamp).to.equal(eventsCopy[eventsTail].timestamp)
    })

    it('should return 200 with ASC type and ASC timestamp sorting', async function () {
      const sortByTimestamp = 'asc'
      const sortByType = 'asc'

      let eventsCopy = events.map((event) => event)
      eventsCopy = sortEventsByAscTypeAndAscTimestamp(eventsCopy)

      context.response = await context.request.get(
        `/v1/thing/${thingId}/event/?sortByTimestamp=${sortByTimestamp}&sortByType=${sortByType}`
      )

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(eventsCopy.length)
      expect(context.response.body[0].timestamp).to.equal(eventsCopy[0].timestamp)
      expect(context.response.body[0].type).to.equal(eventsCopy[0].type)
      expect(context.response.body[eventsTail].timestamp).to.equal(eventsCopy[eventsTail].timestamp)
      expect(context.response.body[eventsTail].type).to.equal(eventsCopy[eventsTail].type)
    })

    it('should return 200 with DESC type and ASC timestamp sorting', async function () {
      const sortByTimestamp = 'asc'
      const sortByType = 'desc'

      let eventsCopy = events.map((event) => event)
      eventsCopy = sortEventsByDescTypeAndAscTimestamp(eventsCopy)

      context.response = await context.request.get(
        `/v1/thing/${thingId}/event/?sortByTimestamp=${sortByTimestamp}&sortByType=${sortByType}`
      )

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(eventsCopy.length)
      expect(context.response.body[0].timestamp).to.equal(eventsCopy[0].timestamp)
      expect(context.response.body[0].type).to.equal(eventsCopy[0].type)
      expect(context.response.body[eventsTail].timestamp).to.equal(eventsCopy[eventsTail].timestamp)
      expect(context.response.body[eventsTail].type).to.equal(eventsCopy[eventsTail].type)
    })

    it('should return 200 with ASC type and DESC timestamp sorting', async function () {
      const sortByTimestamp = 'desc'
      const sortByType = 'asc'

      let eventsCopy = events.map((event) => event)
      eventsCopy = sortEventsByDescTypeAndAscTimestamp(eventsCopy)
      eventsCopy.reverse()

      context.response = await context.request.get(
        `/v1/thing/${thingId}/event/?sortByTimestamp=${sortByTimestamp}&sortByType=${sortByType}`
      )

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(eventsCopy.length)
      expect(context.response.body[0].timestamp).to.equal(eventsCopy[0].timestamp)
      expect(context.response.body[0].type).to.equal(eventsCopy[0].type)
      expect(context.response.body[eventsTail].timestamp).to.equal(eventsCopy[eventsTail].timestamp)
      expect(context.response.body[eventsTail].type).to.equal(eventsCopy[eventsTail].type)
    })
  })

  describe('GET events with filtering by event type/s', function () {
    let type
    let anotherType

    before(async function () {
      await context.db('events').del()

      type = 'eventType'
      anotherType = 'anotherType'

      const events = [
        ...createEvents({ date, thingId, total: 50 }),
        ...createEvents({ date, type, thingId, total: 30 }),
        ...createEvents({ date, type: anotherType, thingId, total: 10 }),
      ]

      events.forEach(async (event) => {
        await context.request.post(`/v1/thing/${thingId}/event`).send(event)
      })
      await delay(100)
    })

    it(`should return 200 with the events filtered by a single event type`, async function () {
      context.response = await context.request.get(`/v1/thing/${thingId}/event/?type=${type}`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(30)
      expect(context.response.body.find((event) => event.type !== type)).to.be.undefined
    })

    it(`should return 200 with the events filtered by multiple event types`, async function () {
      context.response = await context.request.get(`/v1/thing/${thingId}/event/?type=${type}&type=${anotherType}`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(40)
      expect(context.response.body.find((event) => event.type !== type && event.type !== anotherType)).to.be.undefined
    })

    it(`should return 200 for invalid/nonexistent event type`, async function () {
      type = null
      context.response = await context.request.get(`/v1/thing/${thingId}/event/?type=${type}`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(0)
    })
  })

  describe('GET events with filtering by start and end dates', function () {
    let startDate
    let endDate

    before(async function () {
      await context.db('events').del()

      const events = createEvents({ date, thingId, total: 102 })

      startDate = events[44].timestamp
      endDate = events[88].timestamp

      events.forEach(async (event) => {
        await context.request.post(`/v1/thing/${thingId}/event`).send(event)
      })
      await delay(100)
    })

    it(`should return 200 within date range`, async function () {
      context.response = await context.request.get(
        `/v1/thing/${thingId}/event/?startDate=${startDate}&endDate=${endDate}`
      )

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(45)
    })

    it(`should return 200 within invalid date range`, async function () {
      const startDate = null
      const endDate = null

      context.response = await context.request.get(
        `/v1/thing/${thingId}/event/?startDate=${startDate}&endDate=${endDate}`
      )

      expect(context.response.status).to.equal(200)
      expect(context.response.body).to.have.length(100)
    })
  })

  describe('POST event', async function () {
    before(async function () {
      await context.db('events').del()
    })

    it('should return 400 (invalid thingId)', async function () {
      context.response = await context.request.post(`/v1/thing/000a0000-a00a-00a0-a000-0000000000/event`).send(event)

      expect(context.response.status).to.equal(400)
      expect(context.response.body).to.deep.equal({})
    })

    it('should return 400 (invalid request body', async function () {
      context.response = await context.request.post(`/v1/thing/${thingId}/event`).send({})

      expect(context.response.status).to.equal(400)
      expect(context.response.body).to.deep.equal({})
    })

    it('should return 201', async function () {
      const event = createEvent({ thingId })
      context.response = await context.request.post(`/v1/thing/${thingId}/event`).send(event)

      expect(context.response.status).to.equal(201)
      expect(context.response.body.type).to.equal(event.type)
    })
  })

  describe('GET event', function () {
    before(async function () {
      await context.db('events').del()
    })

    it('should return 200', async function () {
      const event = createEvent({ thingId })
      const { body } = await context.request.post(`/v1/thing/${thingId}/event`).send(event)

      context.response = await context.request.get(`/v1/thing/${thingId}/event/${body.id}`)

      expect(context.response.status).to.equal(200)
      expect(context.response.body.thingId).to.equal(event.thingId)
      expect(context.response.body.type).to.equal(event.type)
    })
  })

  describe('PUT event', function () {
    before(async function () {
      await context.db('events').del()
    })

    it('should return 400 (invalid thingId and eventId uuid)', async function () {
      context.response = await context.request.put(
        `/v1/thing/000a0000-a00a-00a0-a000-0000000000/event/000a0000-a00a-00a0-a000-0000000000`
      )

      expect(context.response.status).to.equal(400)
      expect(context.response.body).to.deep.equal({})
    })

    it('should return 400 (invalid eventId uuid)', async function () {
      context.response = await context.request.put(
        `/v1/thing/000a0000-a00a-00a0-a000-000000000000/event/000a0000-a00a-00a0-a000-0000000000`
      )

      expect(context.response.status).to.equal(400)
      expect(context.response.body).to.deep.equal({})
    })

    it('should return 400 (invalid request body)', async function () {
      context.response = await context.request
        .put(`/v1/thing/000a0000-a00a-00a0-a000-000000000000/event/000a0000-a00a-00a0-a000-000000000000`)
        .send()

      expect(context.response.status).to.equal(400)
      expect(context.response.body).to.deep.equal({})
    })

    it('should return 404 (thing does not exist)', async function () {
      const updatedEvent = {
        details: { message: 'updated type, name and timestamp!' },
      }
      context.response = await context.request
        .put(`/v1/thing/000a0000-a00a-00a0-a000-000000000000/event/000a0000-a00a-00a0-a000-000000000000`)
        .send(updatedEvent)

      expect(context.response.status).to.equal(404)
      expect(context.response.body).to.deep.equal({})
    })

    it('should return 200', async function () {
      const event = createEvent({ thingId })
      const { body } = await context.request.post(`/v1/thing/${thingId}/event`).send(event)
      const updatedEvent = {
        details: { message: 'updated type, name and timestamp!' },
      }
      context.response = await context.request.put(`/v1/thing/${thingId}/event/${body.id}`).send(updatedEvent)

      expect(context.response.status).to.equal(200)
      expect(context.response.body.thingId).to.equal(thingId)
      expect(context.response.body.type).to.equal(event.type)
      expect(context.response.body.timestamp).to.equal(event.timestamp)
      expect(context.response.body.details).to.deep.equal(updatedEvent.details)
    })
  })
})

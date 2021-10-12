const { describe, before, it } = require('mocha')
const { expect } = require('chai')

const { setupServer } = require('./helpers/server')
const { setupKafka, getConsumer } = require('./helpers/kafka')
const { setupDb } = require('./helpers/db')
const { publishEventAndWait, getEvents } = require('./helpers/events')
const { assertEvents } = require('./helpers/assertions')

describe('event ingest', function () {
  const context = {}
  setupServer(context)
  setupKafka()
  setupDb(context)

  let events

  before(function () {
    getConsumer().clearMessages()
    events = [
      {
        thingId: 'ee4b3481-ce8d-43a6-a8f1-8a8e2fbeb242',
        type: 'eventTypeOne',
        details: JSON.stringify({}),
        timestamp: '2021-04-07T00:00:00.000Z',
      },
      {
        thingId: 'fe4b3481-ce8d-43a6-a8f1-8a8e2fbeb244',
        type: 'eventTypeTwo',
        details: JSON.stringify({}),
        timestamp: '2021-04-07T00:11:00.000Z',
      },
    ]
  })

  beforeEach(async function () {
    await context.db('events').del()
  })

  describe('simple event', function () {
    it('should create the event', async function () {
      await publishEventAndWait(context, events[0])
      await getConsumer().waitForNMessages(1)
      context.events = await getEvents(context)
    })

    it('should create the event', function () {
      assertEvents(context.events, [
        {
          thingId: 'ee4b3481-ce8d-43a6-a8f1-8a8e2fbeb242',
          timestamp: new Date('2021-04-07T00:00:00.000Z'),
          eventType: 'eventTypeOne',
          details: JSON.stringify({}),
        },
      ])
    })
  })

  describe('multiple events', function () {
    before(async function () {
      getConsumer().clearMessages()
      const events = [
        {
          thingId: 'ee4b3481-ce8d-43a6-a8f1-8a8e2fbeb242',
          type: 'eventTypeOne',
          details: JSON.stringify({}),
          timestamp: '2021-04-07T00:00:00.000Z',
        },
        {
          thingId: 'fe4b3481-ce8d-43a6-a8f1-8a8e2fbeb244',
          type: 'eventTypeTwp',
          details: JSON.stringify({}),
          timestamp: '2021-04-07T00:11:00.000Z',
        },
      ]

      await publishEventAndWait(context, events[0])
      await publishEventAndWait(context, events[1])
      await getConsumer().waitForNMessages(2)
      context.events = await getEvents(context)
    })

    it('should create the event', function () {
      assertEvents(context.events, [
        {
          thingId: 'ee4b3481-ce8d-43a6-a8f1-8a8e2fbeb242',
          timestamp: new Date('2021-04-07T00:00:00.000Z'),
          eventType: 'eventTypeOne',
          details: JSON.stringify({}),
        },
        {
          thingId: 'fe4b3481-ce8d-43a6-a8f1-8a8e2fbeb244',
          timestamp: new Date('2021-04-07T00:11:00.000Z'),
          eventType: 'eventTypeTwo',
          details: JSON.stringify({}),
        },
      ])
    })

    it('should produce multiple event notifications', async function () {
      const messages = getConsumer().getMessages()
      expect(messages.length).to.equal(2)
      for (let i = 0; i < messages.length; i++) {
        expect(messages[i]).to.have.property('key')
        expect(messages[i]).to.have.property('value')
        expect(messages[i].value.event).to.have.property('thingId')
        expect(messages[i].value.event).to.have.property('type')
        expect(messages[i].value.event).to.have.property('details')
        expect(messages[i].value.event).to.have.property('timestamp')
      }
    })
  })
})

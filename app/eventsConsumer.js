import { Kafka, logLevel as kafkaLogLevels } from 'kafkajs'

import { addEvent } from './db.js'
import logger from './logger.js'
import env from './env.js'

const { KAFKA_BROKERS, KAFKA_LOG_LEVEL, KAFKA_EVENTS_TOPIC, KAFKA_EVENTS_NOTIFICATIONS_TOPIC } = env

const setupEventsConsumer = async () => {
  const kafkaLogger = logger.child({ module: 'kafkajs-events', level: 'error' })
  const logCreator =
    () =>
    ({ label, log }) => {
      const { message } = log
      kafkaLogger[label.toLowerCase()]({
        message,
      })
    }

  const kafka = new Kafka({
    clientId: 'event-service-events',
    brokers: KAFKA_BROKERS,
    logLevel: kafkaLogLevels[KAFKA_LOG_LEVEL.toUpperCase()],
    logCreator,
  })

  const producer = kafka.producer()
  await producer.connect()

  const consumer = kafka.consumer({ groupId: 'event-service-events' })
  await consumer.connect()
  await consumer.subscribe({ topic: KAFKA_EVENTS_TOPIC, fromBeginning: true })

  await consumer
    .run({
      eachMessage: async ({ message: { key: thingId, value } }) => {
        try {
          logger.debug('Event received for %s', thingId)
          logger.trace(`Event is ${value.toString('utf8')}`)

          const event = JSON.parse(value.toString('utf8'))

          await addEvent(event)

          // Broadcast for streaming service
          await producer.send({
            topic: KAFKA_EVENTS_NOTIFICATIONS_TOPIC,
            messages: [
              {
                key: thingId,
                value: JSON.stringify({ event }),
              },
            ],
          })
        } catch (err) {
          logger.warn(`Unexpected error processing payload. Error was ${err.message || err}`)
        }
      },
    })
    .then(() => {
      logger.info(`Kafka consumer has started`)
    })
    .catch((err) => {
      logger.fatal(`Kafka consumer could not start consuming. Error was ${err.message || err}`)
    })

  return {
    disconnect: async () => {
      try {
        await consumer.stop()
        await consumer.disconnect()
      } catch (err) {
        logger.warn(`Error disconnecting from kafka: ${err.message || err}`)
      }
    },
  }
}

export default setupEventsConsumer

const envalid = require('envalid')
const dotenv = require('dotenv')
const { version } = require('../package.json')

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: 'test/test.env' })
}

const vars = envalid.cleanEnv(
  process.env,
  {
    SERVICE_TYPE: envalid.str({ default: 'wasp-event-service'.toUpperCase().replace(/-/g, '_') }),
    LOG_LEVEL: envalid.str({ default: 'info', devDefault: 'debug' }),
    PORT: envalid.port({ default: 80, devDefault: 3000 }),

    DB_HOST: envalid.host({ devDefault: 'localhost' }),
    DB_PORT: envalid.port({ default: 5432 }),
    DB_NAME: envalid.str({ default: 'events' }),
    DB_USERNAME: envalid.str({ devDefault: 'postgres' }),
    DB_PASSWORD: envalid.str({ devDefault: 'postgres' }),
    API_VERSION: envalid.str({ default: version }),
    API_MAJOR_VERSION: envalid.str({ default: 'v1' }),
    API_OFFSET_LIMIT: envalid.num({ default: 100 }),

    KAFKA_LOG_LEVEL: envalid.str({
      default: 'nothing',
      choices: ['debug', 'info', 'warn', 'error', 'nothing'],
    }),
    KAFKA_BROKERS: envalid.makeValidator((input) => {
      const kafkaSet = new Set(input === '' ? [] : input.split(','))
      if (kafkaSet.size === 0) throw new Error('At least one kafka broker must be configured')
      return [...kafkaSet]
    })({ default: 'localhost:9092' }),
    KAFKA_EVENTS_TOPIC: envalid.str({ default: 'events' }),
    KAFKA_EVENTS_NOTIFICATIONS_TOPIC: envalid.str({ default: 'event-notifications' }),
  },
  {
    strict: true,
  }
)

module.exports = vars

const { before } = require('mocha')
const knex = require('knex')

const { DB_HOST, DB_NAME, DB_PORT, DB_USERNAME, DB_PASSWORD } = require('../../app/env')

const setupDb = (context) => {
  before(async function () {
    context.db = knex({
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
  })
}

module.exports = {
  setupDb,
}

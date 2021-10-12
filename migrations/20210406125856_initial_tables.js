exports.up = async (knex) => {
  // check extension is not installed
  const [extInstalled] = await knex('pg_extension').select('*').where({ extname: 'uuid-ossp' })

  if (!extInstalled) {
    await knex.raw('CREATE EXTENSION "uuid-ossp"')
  }

  const uuidGenerateV4 = () => knex.raw('uuid_generate_v4()')
  const now = () => knex.fn.now()

  await knex.schema.createTable('events', (def) => {
    def.uuid('id').primary().defaultTo(uuidGenerateV4())
    def.uuid('thing_id').notNullable()
    def.string('type', 50).notNullable()
    def.jsonb('details').notNullable().defaultTo({})
    def.datetime('timestamp').notNullable()
    def.datetime('created_at').notNullable().default(now())
    def.datetime('updated_at').notNullable().default(now())

    def.index(['thing_id', 'timestamp'])
    def.index(['thing_id', 'type', 'timestamp'])
  })
}

exports.down = async (knex) => {
  await knex.schema.dropTable('events')
  await knex.raw('DROP EXTENSION "uuid-ossp"')
}

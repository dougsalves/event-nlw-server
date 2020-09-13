import Knex from 'knex'

const tableName = 'connections'

export async function up(knex: Knex) {
    return knex.schema.createTable(tableName, table => {
        table.increments('id').primary()
        
        table.integer('user_id')
            .references('id')
            .inTable('users')
            .notNullable()
            .onUpdate('CASCADE')
            .onDelete('CASCADE')

        table.timestamp('created_at')
            .defaultTo(knex.raw('CURRENT_TIMESTAMP'))
            .notNullable()
    })
}

export async function down(knex: Knex) {
    return knex.schema.dropTable(tableName)
}
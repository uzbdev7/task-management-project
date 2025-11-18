/* eslint-disable no-undef */

exports.up = function (knex) {
  return knex.schema.createTable('comments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('task_id').notNullable();
    table.foreign('task_id').references('tasks.id').onDelete('CASCADE');
    table.uuid('author_id').notNullable();
    table.foreign('author_id').references('users.id').onDelete('CASCADE');
    table.text('content').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('comments');
};

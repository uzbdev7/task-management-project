/* eslint-disable no-undef */
exports.up = function(knex) {
  return knex.schema.createTable('tasks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title', 255).notNullable();
    table.text('description');
    table.enu('status', ['pending', 'in progress', 'completed', 'archived']).defaultTo('pending');
    table.enu('priority', ['low', 'medium', 'high']).defaultTo('medium');
    table.date('due_date');
    table.uuid('assigned_to').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tasks');
};

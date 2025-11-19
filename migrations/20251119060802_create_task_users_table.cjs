exports.up = function(knex) {
  return knex.schema.createTable('task_users', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('task_id').notNullable().references('id').inTable('tasks').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('assigned_at').defaultTo(knex.fn.now());
    table.unique(['task_id', 'user_id']); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('task_users');
};


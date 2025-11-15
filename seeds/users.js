export async function seed(knex) {
  await knex('users').del(); 
  await knex('users').insert([
    { name: 'Ahrorbek', email: 'ahror@example.com' },
    { name: 'Ali', email: 'ali@example.com' },
  ]);
}

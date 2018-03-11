exports.up = function(knex) {
  // return knex.schema.raw('CREATE SCHEMA charity').then(function() {
  //   return knex.schema.withSchema('charity').createTable('raw_data', function(table) {
  //     table.increments('id');
  //     table.jsonb('data');
  //   });
  // });
};

exports.down = function(knex) {
  // return knex.schema.raw('DROP SCHEMA charity CASCADE');
};

const { afterAll } = require('@jest/globals');

afterAll(() => {
  const pool = require('./db/pool');
  pool.end();
});

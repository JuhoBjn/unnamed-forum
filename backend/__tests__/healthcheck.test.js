const { describe, it, expect } = require('@jest/globals');
const supertest = require('supertest');

const app = require('../app');

describe('The healtcheck endpoint', () => {
  it('should return status 200', async () => {
    const response = await supertest(app).get('/healthcheck');
    expect(response.status).toEqual(200);
  });
});

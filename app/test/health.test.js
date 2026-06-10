const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/index');

test('GET / returns frontend page', async () => {
  const response = await request(app).get('/');
  assert.equal(response.statusCode, 200);
  assert.match(response.headers['content-type'], /text\/html/);
  assert.match(response.text, /DevOps Project Control Room/);
});

test('GET /health returns app status', async () => {
  const response = await request(app).get('/health');
  assert.ok([200, 503].includes(response.statusCode));
  assert.equal(response.body.app, 'up');
});

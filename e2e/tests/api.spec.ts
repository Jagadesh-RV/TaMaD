import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:5000/api';

test('health endpoint returns healthy', async ({ request }) => {
  const response = await request.get(`${API_URL}/health`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.status).toBe('healthy');
  expect(body.services).toBeDefined();
  expect(body.services.database.status).toBe('ok');
});

test('health simple endpoint is fast', async ({ request }) => {
  const start = Date.now();
  const response = await request.get(`${API_URL}/health/simple`);
  const latency = Date.now() - start;
  expect(response.ok()).toBeTruthy();
  expect(latency).toBeLessThan(2000);
});

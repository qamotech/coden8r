import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGatewayHeaders, getGatewayAuthStrategies, resolveGatewayBaseUrl } from '../gateway-helpers.js';

test('buildGatewayHeaders uses the Gemini API key header for API keys', () => {
  assert.deepEqual(buildGatewayHeaders('AIzaTestKey123'), {
    'x-goog-api-key': 'AIzaTestKey123',
    Accept: 'application/json'
  });
});

test('buildGatewayHeaders uses the Authorization header for bearer tokens', () => {
  assert.deepEqual(buildGatewayHeaders('Bearer test-token'), {
    Authorization: 'Bearer test-token',
    Accept: 'application/json'
  });
});

test('getGatewayAuthStrategies falls back to a bearer strategy for non-key input', () => {
  const strategies = getGatewayAuthStrategies('my-token');
  assert.equal(strategies.length, 2);
  assert.deepEqual(strategies[0].headers, {
    'x-goog-api-key': 'my-token',
    Accept: 'application/json'
  });
  assert.deepEqual(strategies[1].headers, {
    Authorization: 'Bearer my-token',
    Accept: 'application/json'
  });
});

test('resolveGatewayBaseUrl normalizes localhost gateways to /v1', () => {
  assert.equal(resolveGatewayBaseUrl('http://localhost:8000'), 'http://localhost:8000/v1');
  assert.equal(resolveGatewayBaseUrl('http://127.0.0.1:8000/v1'), 'http://127.0.0.1:8000/v1');
  assert.equal(resolveGatewayBaseUrl('https://api.custom-domain.local/v1beta'), 'https://api.custom-domain.local/v1beta');
  assert.equal(resolveGatewayBaseUrl(''), 'https://generativelanguage.googleapis.com/v1beta');
});

test('resolveGatewayBaseUrl handles bare localhost with no port or slash', () => {
  assert.equal(resolveGatewayBaseUrl('http://localhost'), 'http://localhost/v1');
  assert.equal(resolveGatewayBaseUrl('http://127.0.0.1'), 'http://127.0.0.1/v1');
});


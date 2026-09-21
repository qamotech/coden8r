export function getGatewayAuthStrategies(rawKey) {
  const key = String(rawKey || '').trim();
  if (!key) {
    return [];
  }

  const normalizedKey = key.replace(/^Bearer\s+/i, '').trim();
  const isApiKey = /^AIza[0-9A-Za-z\-_]{10,}$/.test(normalizedKey);
  const strategies = [];

  if (/^Bearer\s+/i.test(key)) {
    strategies.push({
      name: 'bearer-auth',
      headers: {
        Authorization: `Bearer ${normalizedKey}`,
        Accept: 'application/json'
      }
    });
    strategies.push({
      name: 'gemini-api-key',
      headers: {
        'x-goog-api-key': normalizedKey,
        Accept: 'application/json'
      }
    });
  } else if (isApiKey) {
    strategies.push({
      name: 'gemini-api-key',
      headers: {
        'x-goog-api-key': normalizedKey,
        Accept: 'application/json'
      }
    });
  } else {
    strategies.push({
      name: 'gemini-api-key',
      headers: {
        'x-goog-api-key': normalizedKey,
        Accept: 'application/json'
      }
    });
    strategies.push({
      name: 'bearer-auth',
      headers: {
        Authorization: `Bearer ${normalizedKey}`,
        Accept: 'application/json'
      }
    });
  }

  return strategies;
}

export function buildGatewayHeaders(rawKey) {
  const strategies = getGatewayAuthStrategies(rawKey);
  return strategies[0]?.headers || { Accept: 'application/json' };
}

export function resolveGatewayBaseUrl(rawBaseUrl) {
  const fallback = 'https://generativelanguage.googleapis.com/v1beta';
  const baseUrl = String(rawBaseUrl || '').trim();
  if (!baseUrl) {
    return fallback;
  }

  const normalized = baseUrl.replace(/\/+$/, '');
  if (/^https?:\/\/localhost(?::\d+)?(?:\/|$|[?#])/i.test(normalized) || /^https?:\/\/localhost$/i.test(normalized) || /^https?:\/\/127\.0\.0\.1(?::\d+)?(?:\/|$|[?#])/i.test(normalized) || /^https?:\/\/127\.0\.0\.1$/i.test(normalized)) {
    return normalized.endsWith('/v1') ? normalized : `${normalized}/v1`;
  }

  return normalized;
}

if (typeof globalThis !== 'undefined') {
  globalThis.GatewayHelpers = { buildGatewayHeaders, getGatewayAuthStrategies, resolveGatewayBaseUrl };
}

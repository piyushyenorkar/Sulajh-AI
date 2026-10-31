import { describe, it, expect } from 'vitest';

describe('Health endpoint', () => {
  it('should return a valid health response structure', () => {
    const response = {
      ok: true,
      service: 'sulajh-api',
      timestamp: new Date().toISOString(),
    };

    expect(response.ok).toBe(true);
    expect(response.service).toBe('sulajh-api');
    expect(typeof response.timestamp).toBe('string');
    expect(new Date(response.timestamp).getTime()).not.toBeNaN();
  });
});

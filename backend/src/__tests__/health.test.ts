import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('mongoose', () => ({
  default: {
    connection: {
      readyState: 1,
    },
  },
}));

import { health } from '../controllers/health.controller';

describe('Health Controller', () => {
  it('returns 200 with status OK when DB is connected', () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = {} as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = { status, json } as any;

    health(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      status: 'OK',
      service: 'backend',
      db: 'UP',
    });
  });
});

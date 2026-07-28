import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../models/User', () => ({
  default: {
    findById: vi.fn(),
  },
}));

import { protect } from '../middleware/auth.middleware';

function createReq(headers: Record<string, string> = {}, cookies: Record<string, string> = {}) {
  return {
    headers,
    cookies,
  } as any;
}

function createRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

describe('Auth Middleware - protect', () => {
  it('returns 401 when no token is provided', () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized, no token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when authorization header is not Bearer', () => {
    const req = createReq({ authorization: 'Basic abc123' });
    const res = createRes();
    const next = vi.fn();

    protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized, no token' });
  });

  it('returns 401 when token is invalid', async () => {
    const req = createReq({ authorization: 'Bearer invalid-token' });
    const res = createRes();
    const next = vi.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized, token failed' });
    expect(next).not.toHaveBeenCalled();
  });

  it('uses cookie token when no authorization header', async () => {
    const req = createReq({}, { tamad_access_token: 'invalid-token' });
    const res = createRes();
    const next = vi.fn();

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authorized, token failed' });
  });
});

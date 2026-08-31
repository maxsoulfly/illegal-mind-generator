// Thin fetch wrapper for the local API server. In dev, Vite proxies /api/* to
// the Express server and injects the Authorization header (see vite.config.js),
// so nothing here handles auth or CORS. Kept deliberately small — added in the
// persistence migration's Step 7 (tag_overrides cutover) and reused by every
// later domain cutover.
//
// See C:\Users\Max\.claude\plans\one-signal-many-terminals.md.

const BASE = '/api';

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function request(method, pathname, body) {
  const res = await fetch(`${BASE}${pathname}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  let parsed = text;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON body — keep the raw text
  }

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === 'object' && parsed.error) ||
      `${method} ${pathname} failed (${res.status})`;
    throw new ApiError(message, res.status, parsed);
  }

  return parsed;
}

// In-flight GET de-dupe: useTagOverrides is mounted twice on the same render
// pass (App.jsx + useInputFormLogic.js) for the same projectId — without this
// they'd each fire an identical GET. Keyed by full path; the entry clears as
// soon as the request settles, so this is a request coalescer, not a cache
// (a later edit still triggers a fresh fetch).
const inFlightGets = new Map();

export function apiGet(pathname) {
  const existing = inFlightGets.get(pathname);
  if (existing) return existing;

  const promise = request('GET', pathname).finally(() => {
    inFlightGets.delete(pathname);
  });

  inFlightGets.set(pathname, promise);
  return promise;
}

export const apiPut = (pathname, body) => request('PUT', pathname, body);
export const apiPatch = (pathname, body) => request('PATCH', pathname, body);
export const apiPost = (pathname, body) => request('POST', pathname, body);
export const apiDelete = (pathname) => request('DELETE', pathname);

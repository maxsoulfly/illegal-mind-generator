// Static shared-secret auth (see the Persistence plan's "API auth model —
// decided" section) — a single long token, sent as a Bearer header, checked
// against the server's own configured API_KEY. No sessions, no per-user
// accounts — this is still a single user on two personal PCs.
export function requireApiKey(req, res, next) {
  const configuredKey = process.env.API_KEY;

  if (!configuredKey) {
    res.status(500).json({ error: 'Server misconfigured: API_KEY is not set' });
    return;
  }

  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || token !== configuredKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}

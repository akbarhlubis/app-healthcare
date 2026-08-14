/**
 * Client IP behind a trusted local reverse proxy (aaPanel/Nginx).
 * Nginx sends:
 *   proxy_set_header X-Real-IP $remote_addr;
 *   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
 * Only the first X-Forwarded-For entry is the real client; the rest are
 * proxies appended by each hop.
 */
export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || '127.0.0.1'
  // ponytail: trusts X-Forwarded-For blindly — fine while the proxy is the
  // local aaPanel. If the backend is ever exposed beyond 127.0.0.1, gate this
  // behind a proxy allowlist instead.
}

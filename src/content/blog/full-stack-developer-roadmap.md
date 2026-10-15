Most full stack developer roadmaps list fifty technologies and leave you to work out the order. This one is the order I'd follow if I were starting again in 2026, with a project milestone at each stage so you know when to move on. I'll also cover what you can skip.

The rule behind all of it: **learn one thing per layer, build something with it, then move on.** Depth in one stack beats a shallow tour of five.

## Stage 1: HTML, CSS and JavaScript

Everything else sits on these. Don't rush past them.

- **HTML:** semantic elements (`header`, `main`, `nav`, `button` vs `div`), forms, accessibility basics like labels and alt text.
- **CSS:** the box model, Flexbox, Grid, responsive design with media queries, and CSS variables. Learn Tailwind later if you like, but understand the CSS it generates.
- **JavaScript:** variables and scope, functions, arrays and objects, `map`/`filter`/`reduce`, destructuring, modules, Promises and `async`/`await`, `fetch`, and DOM events.

The one concept that unlocks the rest is asynchronous JavaScript:

```js
async function getUser(id) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

getUser(1)
  .then((user) => console.log(user.name))
  .catch((err) => console.error(err.message));
```

**Milestone:** a responsive multi-page site plus a small vanilla JS app that calls a public API (weather, movies, GitHub profiles) and handles loading and error states.

## Stage 2: Git and GitHub

Learn this early, not at the end. Every project from here on should live in a repository.

- `init`, `add`, `commit`, `push`, `pull`, `branch`, `merge`
- Writing useful commit messages
- Resolving a merge conflict without panic
- Pull requests, even on your own repos

**Milestone:** every project so far is on GitHub with a README explaining what it does and how to run it.

## Stage 3: React

Start with Vite, not a framework. Learn:

- Components, props and JSX
- State with `useState`, side effects with `useEffect` (and when you don't need an effect)
- Lists, keys, conditional rendering, controlled forms
- Lifting state up, context for shared state
- A router (React Router or TanStack Router)
- Data fetching with TanStack Query

**Milestone:** a multi-page React app with routing, forms and API data. A personal finance tracker or a recipe app is a good size.

## Stage 4: TypeScript

Add TypeScript once React feels comfortable. Doing both at once is a common source of frustration.

Focus on the 20% you'll use daily: types and interfaces, union types, generics at a basic level, typing props and API responses, and `strict` mode. Then convert your Stage 3 project to TypeScript. You'll learn more from fixing those errors than from any tutorial.

**Milestone:** your React app runs with `"strict": true` and no `any` in your own code.

## Stage 5: A Backend (Node/Express or FastAPI)

Pick one. Not both.

- **Node.js + Express** if you want one language across the stack.
- **Python + FastAPI** if you're interested in AI/ML or data work.

I compare them in detail in [FastAPI vs Node.js](/blog/fastapi-vs-nodejs). Whichever you choose, learn:

- REST design: resources, HTTP methods, status codes
- Routing, middleware, request validation (Zod or Pydantic)
- Error handling and logging
- Environment variables and config

**Milestone:** a REST API with CRUD endpoints, validation and proper status codes, consumed by your React app.

## Stage 6: SQL and PostgreSQL

Learn SQL properly before reaching for an ORM. You should be able to write this without looking it up:

```sql
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY order_count DESC;
```

Cover tables, primary and foreign keys, joins, indexes, transactions and migrations. Then use an ORM or query builder (Prisma or Drizzle for Node, SQLAlchemy for Python) knowing what it generates.

MongoDB is worth knowing exists, but I'd start with Postgres. Relational modeling teaches you to think about data, and most business apps are relational anyway.

**Milestone:** your API stores data in Postgres with migrations, and you can explain every table relationship.

## Stage 7: Authentication

This is where many tutorial projects are insecure. Learn:

- Password hashing with bcrypt or argon2
- Sessions vs JWTs, and why tokens shouldn't live in `localStorage`
- httpOnly cookies, CORS, and CSRF basics
- Role-based authorization

I walk through a full implementation in [JWT authentication in React + Node.js](/blog/jwt-authentication-react-node). It's also fine to use a managed provider (Auth.js, Clerk, Supabase Auth) in production, but build it once yourself so you understand what they do.

**Milestone:** sign up, log in, log out, protected routes, and users who can only see their own data.

## Stage 8: Testing

You don't need 100% coverage. You need confidence that the important paths work.

- **Unit tests** with Vitest (or pytest) for business logic
- **API tests** with Supertest or FastAPI's `TestClient`
- **One or two end-to-end tests** with Playwright for critical flows like login and checkout

**Milestone:** CI on GitHub Actions runs your tests on every push.

## Stage 9: Docker and Deployment

A project that only runs on your laptop is half finished.

- Write a Dockerfile for your API and a `docker-compose.yml` with Postgres (see [Docker for web developers](/blog/docker-for-web-developers))
- Deploy the frontend to a static host or Vercel
- Deploy the API and database to a VPS or a managed platform
- Set up a domain, HTTPS, and environment variables in production

**Milestone:** a live URL you can put on your CV, with automatic deploys from `main`.

## Stage 10: AI Integration

In 2026, adding LLM features is a normal full-stack skill, not a specialty. Learn:

- Calling an LLM API from your backend (never from the browser with your key exposed)
- Streaming responses to the UI
- Structured output (asking for JSON and validating it)
- Retrieval-augmented generation (RAG) with embeddings and a vector store such as pgvector
- Cost control, rate limiting, and handling bad model output

**Milestone:** add a real AI feature to an existing project, for example "ask questions about your own notes" with RAG over your Postgres data.

## The Roadmap at a Glance

| Stage | Learn | Build |
|---|---|---|
| 1 | HTML, CSS, JavaScript | Responsive site + API-driven JS app |
| 2 | Git, GitHub | Everything in repos with READMEs |
| 3 | React | Multi-page app with routing and forms |
| 4 | TypeScript | Convert the React app to strict TS |
| 5 | Express or FastAPI | CRUD REST API |
| 6 | SQL, PostgreSQL | Persistent data with migrations |
| 7 | Authentication | Login, protected routes, per-user data |
| 8 | Testing | CI running unit, API and E2E tests |
| 9 | Docker, deployment | Live app with a real domain |
| 10 | AI integration | An LLM feature with streaming or RAG |

## What to Skip (For Now)

- **Learning three frameworks.** React is enough. Vue and Svelte are fine, but switching won't make you more employable early on.
- **Kubernetes and microservices.** A single container and a managed database will take you much further than people expect.
- **GraphQL first.** Learn REST well. Add GraphQL when a project needs it.
- **Every CSS framework.** Pick Tailwind or plain CSS modules and move on.
- **Endless tutorials.** If you've watched three courses on one topic without building something, stop watching.
- **Premature optimization.** Caching layers, message queues and edge functions come after you have users.

## FAQ

### How long does it take to become a full stack developer?

It depends on hours per week and prior experience, so I won't give a fixed number. What I can say is that progress comes from finishing projects at each stage, not from time spent. Someone who ships the ten milestones above is job-ready regardless of the calendar.

### Should I learn frontend or backend first?

Frontend first. You get visual feedback quickly, which keeps motivation up, and you'll understand what the backend needs to provide when you get there.

### Do I need a computer science degree?

No. You need the fundamentals: data structures at a practical level, how HTTP works, how databases store and query data. Those can be learned without a degree, and a strong portfolio of deployed projects carries a lot of weight.

### Is full stack development still worth learning with AI coding tools?

Yes. AI tools make writing code faster, but someone still has to design the system, review generated code, debug production issues and make security decisions. Those skills come from understanding every layer, which is what this roadmap builds.

If you're a business looking for someone who already works across this whole stack, take a look at [my services](/services) or [get in touch](/contact).

Adding an AI chatbot to your website is easier than it looks, but there's one mistake I see constantly: calling the LLM API straight from the browser with the API key in the frontend code. In this post I'll show you how to add an AI chatbot to your website the safe way — a small serverless function holds the key, your React frontend talks to that function, and you keep abuse and cost under control.

## Why you should never call the LLM from the browser

Anything you ship to the browser is public. That includes environment variables bundled by Vite or Next.js with a public prefix, minified JavaScript, and network requests visible in DevTools. If your API key is in the frontend:

- Anyone can copy it and use it for their own projects on your bill.
- Bots that scan public sites and GitHub for keys will find it.
- You can't enforce rate limits, input limits or which model is used — the attacker controls the request.

The fix is a simple architecture:

1. The browser sends the user's message to **your** endpoint (`/api/chat`).
2. Your server-side function adds the system prompt, calls the LLM with the secret key, and returns the answer.
3. The key never leaves the server.

## The stack

| Layer | Choice in this post | Notes |
|---|---|---|
| Frontend | React | Works the same in Next.js, Vue or plain JS |
| Backend | Vercel serverless function | Netlify Functions, Cloudflare Workers or Express work too |
| LLM | Claude via `@anthropic-ai/sdk` | OpenAI or Gemini are reasonable alternatives |

## Step 1: Store the API key as a server-side secret

Install the SDK and add the key to your Vercel project (not to any file you commit):

```bash
npm install @anthropic-ai/sdk
vercel env add ANTHROPIC_API_KEY
vercel env pull .env.local
```

Do **not** prefix it with `VITE_` or `NEXT_PUBLIC_`. Those prefixes exist specifically to expose values to the browser.

## Step 2: Ground the bot in your own FAQ

A generic chatbot on a business site is a liability: it'll happily answer questions about anything, invent prices, or promise things you don't offer. I keep the bot narrow with a system prompt that contains the real information and clear rules:

```js
// api/_prompt.js
export const SYSTEM_PROMPT = `You are the assistant on the website of a small web development studio.
Your job is to answer visitor questions about our services using ONLY the FAQ below.

<faq>
Q: What services do you offer?
A: Website development, web apps, and AI integrations such as chatbots.

Q: How do I start a project?
A: Use the contact form at /contact with a short description of what you need.

Q: Do you offer maintenance?
A: Yes, ongoing maintenance can be arranged after launch.
</faq>

Rules:
- If the answer is not in the FAQ, say you are not sure and suggest the contact form at /contact.
- Never invent prices, timelines, or guarantees.
- Politely decline requests unrelated to this business.
- Keep answers short: 2-4 sentences.`;
```

Replace the FAQ with your real content. If your knowledge base is too big for a prompt, that's when you move to retrieval — see [How to Build a RAG Chatbot in Python](/blog/how-to-build-a-rag-chatbot-python).

## Step 3: The serverless function

On Vercel, any file in the `api/` folder becomes an endpoint. This one validates input, trims the conversation, calls Claude, and returns plain JSON:

```js
// api/chat.js
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./_prompt.js";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY

const MAX_MESSAGES = 10;
const MAX_CHARS = 1500;

// Best-effort, per-instance rate limiter (see notes below)
const hits = new Map();
function isRateLimited(ip, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "messages must be an array" });
  }

  // Keep only valid, recent messages and cap their length
  const cleaned = messages
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") {
    return res.status(400).json({ error: "The last message must be from the user" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: cleaned,
    });
    const answer = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(502).json({ error: "The assistant is unavailable right now." });
  }
}
```

A few details worth pointing out:

- The client only sends `role` and `content`. The **system prompt and model are fixed on the server**, so nobody can swap them out from DevTools.
- The conversation must start with a user message and end with one; the cleanup enforces that.
- The error response is generic. Never return raw provider errors to the browser.
- This file uses ES module syntax, so make sure your `package.json` has `"type": "module"` (Vite projects usually do).

Run it locally with `vercel dev`, which serves both your frontend and the `api/` folder.

## Step 4: A minimal React chat component

The frontend just keeps the message list in state and posts it to `/api/chat`:

```jsx
import { useState } from "react";

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages([...next, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setMessages([...next, { role: "assistant", content: `Sorry, ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat">
      <div className="chat-log">
        {messages.map((m, i) => (
          <p key={i} className={m.role}>
            <strong>{m.role === "user" ? "You" : "Assistant"}:</strong> {m.content}
          </p>
        ))}
        {loading && <p className="assistant">Thinking...</p>}
      </div>
      <form onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          maxLength={1500}
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
}
```

That's a complete, working chatbot. Style it however you like.

## Step 5: Rate limiting and abuse protection

The in-memory limiter above is a starting point, not a real defense. Serverless functions run on multiple instances that don't share memory, and instances get recycled. For a public site I'd add:

- **A shared rate limit store**, such as Redis (Upstash or similar), keyed by IP, so limits apply across instances.
- **Bot protection** on the form, such as Cloudflare Turnstile or similar, verified inside the function before calling the LLM.
- **Input caps** (already in the code) so nobody can paste a novel into each message.
- **Logging** of request counts per IP, so you can spot abuse quickly.

## Step 6: Keep costs predictable

LLM pricing is per token, both input and output. The levers that actually matter:

- **Set `max_tokens`** to what a chat answer really needs. The system prompt also asks for short answers.
- **Trim the history.** Sending the last 10 messages instead of the whole conversation keeps input tokens bounded.
- **Keep the system prompt lean.** It's sent with every request.
- **Set a spending limit** in your provider console so a bug or an attack can't run up an unlimited bill.
- **Consider a smaller model** for simple FAQ answering. Check your provider's current model list and pricing page.

## Next step: streaming

Right now the user waits until the whole answer is generated. Streaming sends text as it's produced, which makes the bot feel much faster. The Anthropic SDK supports streaming, and you'd forward chunks from your function to the browser using server-sent events or a streamed response, then append them to the last message in React. I'd get the non-streaming version working and deployed first, then add streaming as an improvement.

## FAQ

### Can I hide my API key in environment variables in React?

Not if they're bundled into the frontend. Variables prefixed with `VITE_`, `NEXT_PUBLIC_` or `REACT_APP_` end up in the JavaScript that ships to users. Only server-side code should read the key.

### Do I need a full backend to add a chatbot to a static site?

No. A single serverless function (Vercel, Netlify or Cloudflare) is enough to hold the key and proxy requests. Your site can stay static.

### How do I stop the chatbot from answering off-topic questions?

Give it a narrow system prompt with your actual content, tell it what to do when something isn't covered, and tell it to decline unrelated requests. It won't be perfect, so keep it away from anything high-stakes.

### How much does it cost to run an AI chatbot on a website?

It depends on traffic, conversation length, and the model you pick. Check the provider's pricing page, estimate tokens per conversation, and set a hard spending limit in the dashboard.

## Key takeaways

- Never put an LLM API key in frontend code — proxy through a server-side function.
- Fix the system prompt and model on the server; accept only messages from the client.
- Ground the bot in your real FAQ and give it a fallback answer.
- Add proper rate limiting, input caps and a spending limit before you go live.

If you want a chatbot like this built into your site, grounded in your own content and safe to run in production, take a look at [my services](/services) or [get in touch](/contact).

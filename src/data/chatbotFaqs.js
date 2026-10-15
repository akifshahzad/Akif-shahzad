import { SITE } from "../constants";

/**
 * Keyword-matched FAQ entries for the chatbot widget. Every keyword is
 * matched from the start of a word in the lowercased message (short
 * keywords of 3 chars or less must match a whole word, so "ai" doesn't
 * fire on "available"). The entry with the highest score wins, where
 * score = total length of the keywords that matched.
 *
 * `links` render as buttons under the reply: `to` for internal routes,
 * `href` for external URLs. Everything identity-related reads from SITE
 * so the bot never drifts out of sync with the rest of the site.
 */

const FIRST_NAME = SITE.name.split(" ")[0];

const SOCIAL_LINKS = [
  { label: "GitHub", href: SITE.social.github },
  { label: "LinkedIn", href: SITE.social.linkedin },
  { label: "X (Twitter)", href: SITE.social.twitter },
  { label: "Upwork", href: SITE.social.upwork },
  { label: "Fiverr", href: SITE.social.fiverr },
].filter((l) => l.href);

const FREELANCE_LINKS = SOCIAL_LINKS.filter((l) => l.label === "Upwork" || l.label === "Fiverr");

export const CHATBOT_FAQS = [
  {
    id: "greeting",
    match: ["hi", "hello", "hey", "salam", "assalam", "aoa", "good morning", "good evening"],
    reply: `Hey! 👋 I'm ${FIRST_NAME}'s portfolio assistant. Ask me about his skills, AI work, projects, services, pricing, or how to hire him.`,
  },
  {
    id: "about",
    match: ["who are you", "who is", "about you", "about him", "yourself", "introduce", "your name", "akif", "shahzad"],
    reply: `${SITE.name} is a ${SITE.role} based in ${SITE.location}. He builds full-stack web apps (React/Next.js + Node.js or FastAPI) and AI features like LLM chatbots, RAG search and automation.`,
    links: [{ label: "About page", to: "/about" }],
  },
  {
    id: "ai",
    match: [
      "ai", "ai experience", "ai work", "ai project", "artificial intelligence", "llm", "llms", "gpt", "openai", "claude", "gemini",
      "machine learning", "ml", "deep learning", "langchain", "generative", "genai",
    ],
    reply: `${FIRST_NAME} builds practical AI features: LLM-powered chatbots and assistants (OpenAI, Claude, Gemini), RAG pipelines with LangChain and vector databases, local models via Ollama/Hugging Face, and data/ML work in Python with Pandas, scikit-learn and PyTorch.`,
    links: [
      { label: "AI skills", to: "/skills" },
      { label: "AI services", to: "/services" },
    ],
  },
  {
    id: "chatbot",
    match: ["chatbot", "chat bot", "assistant", "bot for my", "customer support bot", "whatsapp bot"],
    reply: `Yes — ${FIRST_NAME} builds custom AI chatbots: trained on your own docs/FAQs, embedded on your website, connected to your database or CRM, with guardrails so it stays on-topic. (This little widget is a simple keyword bot — the client versions use real LLMs.)`,
    links: [{ label: "Discuss a chatbot", to: "/contact" }],
  },
  {
    id: "rag",
    match: ["rag", "retrieval", "vector", "embedding", "pinecone", "chroma", "pgvector", "pdf", "document", "knowledge base"],
    reply: `${FIRST_NAME} builds RAG (retrieval-augmented generation) systems: ingest PDFs, docs or database records, embed them into a vector store (Pinecone, Chroma or pgvector), and let an LLM answer questions with citations from your own data.`,
    links: [{ label: "Services", to: "/services" }],
  },
  {
    id: "fullstack",
    match: ["full stack", "fullstack", "full-stack", "end to end", "end-to-end", "web app", "website", "saas", "mvp"],
    reply: `Full-stack is ${FIRST_NAME}'s core: React/Next.js + TypeScript on the front end, Node.js/Express or Python/FastAPI APIs, PostgreSQL/MongoDB for data, auth, payments, and deployment to Vercel or Docker — idea to production.`,
    links: [{ label: "Projects", to: "/projects" }],
  },
  {
    id: "stack",
    match: ["stack", "tech", "technolog", "tools", "skills", "language", "framework"],
    reply:
      "Frontend: React, Next.js, TypeScript, Tailwind, Redux. Backend: Node.js, Express, Python, FastAPI, Django. Data: PostgreSQL, MySQL, MongoDB, Redis, Prisma, Supabase. AI: OpenAI/Claude/Gemini APIs, LangChain, RAG, Hugging Face. DevOps: Docker, GitHub Actions, Vercel, Linux.",
    links: [{ label: "Full skills breakdown", to: "/skills" }],
  },
  {
    id: "frontend",
    match: ["frontend", "front end", "front-end", "react", "next", "nextjs", "typescript", "tailwind", "ui", "ux", "responsive"],
    reply: `On the front end ${FIRST_NAME} works in React and Next.js with TypeScript and Tailwind CSS — responsive, accessible UIs that score 90+ on Lighthouse.`,
    links: [{ label: "Skills", to: "/skills" }],
  },
  {
    id: "backend",
    match: ["backend", "back end", "back-end", "node", "express", "python", "fastapi", "django", "flask", "api", "rest", "graphql", "apis"],
    reply: `On the back end ${FIRST_NAME} builds REST (and GraphQL) APIs with Node.js/Express and Python/FastAPI — auth, validation, background jobs, third-party integrations and clean, documented endpoints.`,
    links: [{ label: "Skills", to: "/skills" }],
  },
  {
    id: "database",
    match: ["database", "db", "sql", "postgres", "mysql", "mongo", "redis", "supabase", "firebase", "prisma"],
    reply: "He works with PostgreSQL, MySQL and MongoDB, plus Redis for caching, Prisma as an ORM, and Supabase/Firebase when a managed backend fits better.",
  },
  {
    id: "devops",
    match: ["deploy", "devops", "docker", "hosting", "vercel", "aws", "ci", "cd", "github actions", "server"],
    reply: "Deployment is part of the job: Docker containers, CI/CD with GitHub Actions, and hosting on Vercel or a Linux VPS — with environment configs and monitoring set up properly.",
  },
  {
    id: "services",
    match: ["service", "offer", "what can you do", "what do you do"],
    reply: `Services include full-stack web apps, AI chatbots, RAG/document Q&A, AI integrations & automation, React/Next.js apps, landing pages, API integration, bug fixing, and performance optimization.`,
    links: [{ label: "All services", to: "/services" }],
  },
  {
    id: "hire",
    match: ["hire", "available", "availability", "freelance", "work with", "job", "full time", "full-time", "role", "opportunit"],
    reply: `Yes — ${FIRST_NAME} is available for freelance projects and full-time roles (remote or Lahore-based). The fastest way is the contact form or email: ${SITE.email}.`,
    links: [{ label: "Contact", to: "/contact" }, ...FREELANCE_LINKS],
  },
  {
    id: "pricing",
    match: ["price", "pricing", "cost", "rate", "budget", "charge", "fee", "quote", "hourly", "how much"],
    reply:
      "Pricing depends on scope — fixed-price for well-defined projects, hourly for ongoing work. Send a short note with what you're building and your timeline, and you'll get a quote within 24 hours.",
    links: [{ label: "Get a quote", to: "/contact" }],
  },
  {
    id: "timeline",
    match: ["how long", "timeline", "deadline", "duration", "turnaround", "deliver", "urgent", "asap"],
    reply:
      "Rough guide: a landing page takes ~3–7 days, an AI chatbot ~1–2 weeks, and a full-stack MVP ~3–8 weeks. Exact timelines come with the quote once scope is clear.",
  },
  {
    id: "process",
    match: ["process", "how do you work", "workflow", "communication", "update", "methodology", "agile"],
    reply:
      "The process: a short discovery call → written scope & quote → weekly milestones with live preview links → testing → deployment → handover with docs. You get regular updates the whole way.",
  },
  {
    id: "support",
    match: ["support", "maintenance", "after launch", "bug", "fix", "revision", "warranty"],
    reply:
      "Every project includes a free bug-fix window after launch, and ongoing maintenance or feature work is available on a monthly or hourly basis. He also takes on bug-fixing for existing codebases.",
  },
  {
    id: "location",
    match: ["where", "location", "based", "country", "pakistan", "lahore", "time zone", "timezone", "remote"],
    reply: `${FIRST_NAME} is based in ${SITE.location} (PKT, UTC+5) and works remotely with clients worldwide, with flexible overlap for US, UK, EU and Middle East time zones.`,
  },
  {
    id: "languages",
    match: ["speak", "urdu", "english", "communicat"],
    reply: "He communicates fluently in English and Urdu — this site is available in both (use the اردو / English toggle in the top bar).",
  },
  {
    id: "experience",
    match: ["experience", "years", "background", "career", "worked", "education", "certif"],
    reply: "He's been building production apps since 2022, working freelance and on contract. The Experience page has the full timeline, and Certifications lists his credentials.",
    links: [
      { label: "Experience", to: "/experience" },
      { label: "Certifications", to: "/certifications" },
    ],
  },
  {
    id: "projects",
    match: ["project", "portfolio", "work you", "examples", "case stud", "built", "demo"],
    reply: "You can browse his projects on the Projects page — search and filter by technology.",
    links: [{ label: "Projects", to: "/projects" }, { label: "GitHub", href: SITE.social.github }],
  },
  {
    id: "resume",
    match: ["resume", "résumé", "cv"],
    reply: "You can view or download the résumé on the Résumé page.",
    links: [{ label: "Résumé", to: "/resume" }, { label: "Download PDF", href: SITE.resumeUrl }],
  },
  {
    id: "contact",
    match: ["contact", "email", "mail", "reach", "message", "talk", "call", "meeting"],
    reply: `Best ways to reach ${FIRST_NAME}: the Contact page form, email at ${SITE.email}, or a message on LinkedIn.`,
    links: [
      { label: "Contact form", to: "/contact" },
      { label: "Email", href: `mailto:${SITE.email}` },
      { label: "LinkedIn", href: SITE.social.linkedin },
    ],
  },
  {
    id: "social",
    match: ["github", "linkedin", "twitter", "social", "upwork", "fiverr", "profile", "links"],
    reply: `Here are ${FIRST_NAME}'s profiles:`,
    links: SOCIAL_LINKS,
  },
  {
    id: "blog",
    match: ["blog", "article", "guide", "tutorial", "post"],
    reply: "He writes practical guides on AI chatbots, RAG, LLM agents, React, Next.js, Node.js, FastAPI, performance and SEO — searchable by topic on the Blog page.",
    links: [{ label: "Blog", to: "/blog" }],
  },
  {
    id: "meta",
    match: ["are you ai", "are you real", "are you human", "is this ai", "bot"],
    reply: `I'm a lightweight keyword-matching FAQ bot — no AI model behind me. For anything I can't answer, ${FIRST_NAME} replies personally via the contact form.`,
  },
  {
    id: "thanks",
    match: ["thank", "thanks", "thx", "great", "awesome", "bye", "goodbye", "shukriya"],
    reply: `You're welcome! If you'd like to work together, the contact form goes straight to ${FIRST_NAME}. 🙌`,
    links: [{ label: "Contact", to: "/contact" }],
  },
];

export const CHATBOT_FALLBACK = {
  reply: `I don't have an answer for that one yet. Try one of the topics below, or ask ${FIRST_NAME} directly at ${SITE.email}.`,
  links: [{ label: "Contact", to: "/contact" }],
};

export const CHATBOT_GREETING = `Hi! I'm ${FIRST_NAME}'s portfolio assistant. Ask about his full-stack & AI skills, projects, services, pricing, or how to hire him.`;

/** Quick-reply chips shown under the conversation. */
export const CHATBOT_SUGGESTIONS = [
  "What AI work do you do?",
  "What's your tech stack?",
  "Are you available for hire?",
  "Can you build a chatbot for my business?",
  "How much does a project cost?",
  "How long does a project take?",
  "Show me your projects",
  "How can I contact you?",
];

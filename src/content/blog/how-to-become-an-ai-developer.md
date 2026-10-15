If you're a web developer wondering how to become an AI developer in 2026, the good news is that you already have most of the skills that matter. The bulk of AI development work today is building reliable applications around models — APIs, data, backends and UIs — not training models from scratch. Here's the roadmap I'd follow, in order, with what to skip until you actually need it.

## What "AI developer" actually means today

The title covers very different jobs. It helps to know which one you're aiming for:

| Role | Day-to-day work | Math/ML depth needed |
|---|---|---|
| AI application developer | Building features on top of LLM APIs: chatbots, RAG, agents, automation | Low |
| ML engineer | Training, fine-tuning, deploying and monitoring models | Medium to high |
| ML researcher | Inventing new methods and architectures | High |

For most web developers, **AI application developer** is the natural first step. Your experience with APIs, databases, auth, deployment, and user experience transfers directly. This roadmap focuses on that path, with notes on when to go deeper.

## The roadmap at a glance

1. Python (enough to be productive)
2. Calling LLM APIs properly
3. Prompt design
4. RAG: working with your own data
5. Tool calling and agents
6. Evaluation
7. Basic ML — only when a problem requires it
8. Building portfolio projects throughout

## Step 1: Learn enough Python

You can build AI apps in JavaScript/TypeScript, and the major SDKs support it well. But most of the AI ecosystem — data tooling, notebooks, ML libraries, research code — is Python-first, so it's worth being comfortable in both.

Focus on:

- Core syntax, functions, dicts/lists, comprehensions, and classes
- Virtual environments and `pip` (or a tool like `uv`)
- Reading files, JSON, and environment variables
- An API framework: **FastAPI** feels familiar if you know Express
- Basic `pandas` for poking at data

You don't need to master Python before moving on. Learn it *while* doing steps 2–4.

## Step 2: Call LLM APIs properly

Start with a direct API call, not a framework. Understand what's actually sent and returned:

```python
import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=2048,
    system="You are a concise assistant for web developers.",
    messages=[{"role": "user", "content": "Explain what an embedding is in two sentences."}],
)
answer = "".join(block.text for block in response.content if block.type == "text")
print(answer)
```

Then learn the things that matter in production:

- **Messages and roles**: system prompts, multi-turn history, and why you resend the history each time.
- **Tokens**: how input and output tokens drive cost and context limits.
- **Streaming**: showing output as it's generated.
- **Errors and retries**: rate limits, timeouts, and backoff.
- **Security**: never exposing API keys in the browser — I cover this in [How to Add an AI Chatbot to Your Website](/blog/add-ai-chatbot-to-your-website).

Try a couple of providers (Anthropic, OpenAI, Google Gemini). The concepts transfer, and you'll learn which differences actually matter for your use case.

## Step 3: Learn prompt design

Prompting is less about tricks and more about writing clear specs: context, constraints, examples, output formats, and a way for the model to say "I don't know." I've written up the patterns I use in [Prompt Engineering for Developers: 10 Patterns That Actually Work](/blog/prompt-engineering-for-developers).

## Step 4: RAG — make the model use your data

Retrieval-augmented generation is the most common pattern in real AI products: search your documents, put the relevant pieces in the prompt, and have the model answer from them with citations.

Concepts to learn:

- Chunking documents
- Embeddings and similarity search
- Vector stores (Chroma to start; pgvector if you already use PostgreSQL)
- Prompting with retrieved context and citations
- Why retrieval quality matters more than the model

Build one end to end by hand: [How to Build a RAG Chatbot in Python](/blog/how-to-build-a-rag-chatbot-python) walks through the whole thing.

## Step 5: Tool calling and agents

Tool calling lets a model request actions — look up an order, query a database, call an API — that your code executes. Agents are that pattern in a loop. Learn:

- How to write tool definitions with JSON Schema
- The tool-use loop and how results go back to the model
- Guardrails: permissions, validation, confirmation for risky actions, step limits
- When a fixed workflow is better than an agent

My explainer with a complete Python example: [AI Agents Explained: How Tool Calling Actually Works](/blog/ai-agents-explained-tool-calling).

## Step 6: Evaluation

This is the skill that separates people who build demos from people who ship. LLM output is non-deterministic, so "it worked when I tried it" isn't enough.

- Build test sets of real inputs with expected outputs.
- Measure retrieval separately from generation in RAG systems.
- Automate checks where possible (valid JSON, correct label, cites a source).
- Use human review for a sample, and model-graded checks carefully.
- Re-run evals whenever you change prompts, models, or data.

Learn this early. It also gives you great material to talk about in interviews and client calls.

## Step 7: Basic ML — and when you actually need it

You can build a lot without training a model. But some fundamentals are worth knowing, and some problems genuinely need classical ML:

**Learn the basics with scikit-learn** — train/test splits, classification vs regression, overfitting, and metrics like precision and recall. These concepts help you reason about evaluation even for LLM apps.

**Pick up PyTorch when** you need to fine-tune a model, work with custom embeddings, or move toward an ML engineering role.

**Reach for classical ML instead of an LLM when:**

- You have lots of structured, tabular data (prices, churn, fraud signals).
- You need fast, cheap predictions at high volume.
- You need consistent, explainable outputs.

**Stick with LLM APIs when** the input is unstructured language, you have little labeled data, or the task changes often.

## Portfolio project ideas

Projects prove more than certificates. Pick two or three, build them properly, deploy them, and write up what you learned:

- **Documentation Q&A bot** — RAG over a real open-source project's docs, with citations and an eval set.
- **Support email triage** — classify and summarize incoming emails into structured JSON, with a small dashboard.
- **Agent for a real API** — e.g., an assistant that can search and summarize GitHub issues, with confirmation before any write action.
- **Website chatbot** — a grounded FAQ bot with a serverless backend, rate limiting, and cost controls.
- **Classical ML comparison** — solve one problem with scikit-learn and with an LLM, and write up the trade-offs in accuracy, cost and speed.

For each one, include a README covering the architecture, what failed, how you evaluated it, and what you'd do next. That honesty is what makes a portfolio stand out. You can see the kinds of things I build on my [projects](/projects) page.

## A suggested order and pace

| Phase | Focus | Build |
|---|---|---|
| 1 | Python + first API calls | A CLI tool that summarizes text files |
| 2 | Prompt design + structured output | Email triage with JSON output |
| 3 | RAG + vector stores | Docs Q&A bot with citations |
| 4 | Tool calling + agents | A small agent with 2–3 real tools |
| 5 | Evals + deployment | Add test sets and deploy everything |
| 6 | ML fundamentals | A scikit-learn project on tabular data |

How long each phase takes depends on how much time you have. Don't wait to "finish" a phase — overlap them and keep shipping.

## FAQ

### Do I need a math degree to become an AI developer?

Not for AI application development. Comfort with basic statistics helps with evaluation. Deeper linear algebra and calculus matter if you move into training models or ML research.

### Should I learn Python or stick with JavaScript for AI?

Learn both if you can. JavaScript/TypeScript is great for AI features in web apps, and the major SDKs support it. Python is where most of the AI tooling, data work, and ML libraries live.

### Do I need to learn LangChain?

It's useful to know, but don't start there. Build RAG and an agent loop by hand first so you understand what a framework is doing — then decide if it saves you time.

### Can a web developer get into AI without a machine learning background?

Yes. Building production AI features relies heavily on web skills — APIs, backends, databases, auth, and UX. Add LLM-specific skills like RAG, tool calling and evaluation on top, and you're well positioned.

## Key takeaways

- Most AI development work today is application development, where your web skills transfer directly.
- Learn in order: Python, LLM APIs, prompting, RAG, agents, evals — and ML fundamentals when a problem calls for them.
- Build and deploy real projects with honest write-ups, including how you evaluated them.

If you're a business looking for someone who can bridge web development and AI, or you want to talk through a project, [get in touch](/contact).

If you want a chatbot that answers questions about *your* documents instead of making things up, you need retrieval-augmented generation. In this guide I'll show you how to build a RAG chatbot in Python step by step: chunking, embeddings, Chroma, retrieval, a prompt that cites its sources, a FastAPI endpoint, and a simple way to test whether it works.

## What RAG actually is

A language model only knows what it was trained on. RAG (retrieval-augmented generation) fixes that by doing a search *before* the model answers:

1. Split your documents into small chunks and store them in a vector database.
2. When a question comes in, find the chunks most similar to it.
3. Put those chunks into the prompt and ask the model to answer **only** from them.

That's it. Most of the quality comes from steps 1 and 2, not from the model. A great model with bad retrieval still gives bad answers.

## The stack

| Piece | What I use here | Alternatives |
|---|---|---|
| Vector store | Chroma (local, file-based) | pgvector, Qdrant, Pinecone |
| Embeddings | Chroma's default embedding function | OpenAI, Voyage, Cohere embeddings |
| LLM | Claude via the Anthropic SDK | OpenAI GPT models, Google Gemini |
| API | FastAPI | Flask, Express |

You can swap any of these later. I like Chroma for getting started because it needs no server and stores everything in a folder.

Install the dependencies:

```bash
pip install chromadb anthropic fastapi uvicorn
export ANTHROPIC_API_KEY="your-key-here"
```

Put the documents you want to search in a `docs/` folder as `.md` or `.txt` files.

## Step 1: Chunk your documents

Embedding a whole 20-page document as one vector doesn't work well — the meaning gets averaged into mush. You want chunks small enough to be about one thing, but big enough to carry context.

I start with paragraph-aware chunking of roughly 800 characters and a small overlap so an idea split across a boundary isn't lost:

```python
def chunk_text(text, chunk_size=800, overlap=150):
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks, current = [], ""
    for para in paragraphs:
        if len(current) + len(para) + 2 <= chunk_size:
            current = f"{current}\n\n{para}" if current else para
        else:
            if current:
                chunks.append(current)
            tail = current[-overlap:] if current else ""
            current = f"{tail}\n\n{para}" if tail else para
    if current:
        chunks.append(current)
    return chunks
```

A single very long paragraph will still produce an oversized chunk. For real data I also split on headings and keep the heading text at the top of each chunk, because "Refund policy" at the start of a chunk helps retrieval a lot.

## Step 2: Embed and store in Chroma

Chroma will embed documents for you with its default embedding function, so ingestion is short:

```python
# ingest.py
from pathlib import Path
import chromadb

from chunking import chunk_text

client = chromadb.PersistentClient(path="./chroma")
collection = client.get_or_create_collection("docs")

for path in Path("docs").glob("**/*"):
    if path.suffix not in {".md", ".txt"}:
        continue
    chunks = chunk_text(path.read_text(encoding="utf-8"))
    if not chunks:
        continue
    collection.add(
        ids=[f"{path}-{i}" for i in range(len(chunks))],
        documents=chunks,
        metadatas=[{"source": str(path), "chunk": i} for i in range(len(chunks))],
    )

print(f"Stored {collection.count()} chunks")
```

The `source` metadata is what makes citations possible later. If your documents change, use `collection.upsert(...)` with the same arguments so existing IDs get updated instead of skipped.

## Step 3: Retrieve relevant chunks

```python
# rag.py
import anthropic
import chromadb

chroma = chromadb.PersistentClient(path="./chroma")
collection = chroma.get_or_create_collection("docs")
client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from the environment


def retrieve(question, k=4):
    res = collection.query(query_texts=[question], n_results=k)
    return list(zip(res["documents"][0], res["metadatas"][0]))
```

`res["documents"][0]` is the list of matching chunks for the first (and only) query, and `res["metadatas"][0]` lines up with it.

## Step 4: Build a prompt with context and citations

This is where a lot of tutorials get lazy. The prompt should do three things: separate the sources clearly, tell the model to stay inside them, and give it permission to say it doesn't know.

```python
SYSTEM_PROMPT = """You answer questions using only the sources provided.
Rules:
- Cite sources inline like [1] or [2] using the source numbers given.
- If the sources do not contain the answer, say "I couldn't find that in the documentation." Do not guess.
- Keep answers concise and practical."""


def build_context(results):
    parts = []
    for i, (text, meta) in enumerate(results, start=1):
        parts.append(f'<source id="{i}" file="{meta["source"]}">\n{text}\n</source>')
    return "\n\n".join(parts)


def answer_question(question):
    results = retrieve(question)
    context = build_context(results)
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": f"<sources>\n{context}\n</sources>\n\n<question>{question}</question>",
        }],
    )
    answer = "".join(block.text for block in response.content if block.type == "text")
    sources = [{"id": i, "file": meta["source"]} for i, (_, meta) in enumerate(results, start=1)]
    return {"answer": answer, "sources": sources}
```

Returning the source list alongside the answer lets your UI show "Sources: refunds.md, shipping.md" — which builds trust and makes debugging much easier.

## Step 5: Expose it with FastAPI

```python
# app.py
from fastapi import FastAPI
from pydantic import BaseModel

from rag import answer_question

app = FastAPI()


class Question(BaseModel):
    question: str


@app.post("/ask")
def ask(body: Question):
    return answer_question(body.question)
```

Run it and test it:

```bash
uvicorn app:app --reload
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How long do refunds take?"}'
```

I use a plain `def` endpoint here on purpose: the Anthropic and Chroma calls are blocking, and FastAPI runs sync endpoints in a thread pool so they don't block the event loop. If you want to go async, use `anthropic.AsyncAnthropic()` and `async def`.

If you want to put this behind a chat widget on a website, I cover the frontend and API key safety in [How to Add an AI Chatbot to Your Website](/blog/add-ai-chatbot-to-your-website).

## Common failure modes (and fixes)

These are the problems I run into most often when a RAG bot "doesn't work":

- **Retrieval misses the right chunk.** The answer exists, but the right chunk isn't in the top results. Print what you retrieve for every failing question before touching the prompt. Fixes: better chunking, adding headings to chunks, increasing `k`, or hybrid search (keyword + vector).
- **Chunks are too small.** A chunk says "It takes 5–7 business days" without saying *what* takes 5–7 days. Include section titles or a bit of surrounding context.
- **The model answers from general knowledge.** Tighten the system prompt and make "I couldn't find that" an explicitly acceptable answer.
- **Stale data.** You updated a document but never re-ingested it. Automate ingestion with `upsert` and delete chunks for removed files.
- **Conversation follow-ups fail.** "What about for annual plans?" retrieves nothing useful on its own. Rewrite follow-up questions into standalone questions (using the chat history) before retrieving.
- **Messy source documents.** PDFs with headers, footers and broken tables produce garbage chunks. Clean your text before ingesting.

## How to evaluate your RAG chatbot

Don't judge it by chatting with it for five minutes. Write down 20–50 real questions with the file that should answer each one, and measure retrieval separately from generation:

```python
# eval_retrieval.py
from rag import retrieve

TEST_SET = [
    {"question": "How long do refunds take?", "expected_source": "docs/refunds.md"},
    {"question": "Do you ship internationally?", "expected_source": "docs/shipping.md"},
]

hits = 0
for case in TEST_SET:
    sources = [meta["source"] for _, meta in retrieve(case["question"])]
    found = case["expected_source"] in sources
    hits += found
    if not found:
        print(f"MISS: {case['question']} -> {sources}")

print(f"Retrieval hit rate: {hits}/{len(TEST_SET)}")
```

Once retrieval is solid, check the answers themselves: are they correct, do they cite the right source, and do they refuse when the answer isn't in the docs? Include a few questions that *shouldn't* be answerable to test that last part. Re-run the whole set every time you change chunking, the prompt, or the model.

## FAQ

### Do I need LangChain to build a RAG chatbot?

No. As you can see above, a working RAG pipeline is about 80 lines of plain Python. LangChain or LlamaIndex can save time with document loaders and integrations, but I'd build it by hand once so you understand what those frameworks are doing.

### What chunk size should I use for RAG?

There's no universal number. I start around 500–1000 characters with some overlap, then adjust based on my retrieval evaluation. Structured docs (FAQs, policies) often work best when each section is its own chunk.

### Is Chroma good enough for production?

For small to medium document sets and a single service, it can be. If you already run PostgreSQL, pgvector is a good option because your vectors live next to your other data. Pick based on your infrastructure, not hype.

### How do I stop a RAG chatbot from hallucinating?

You can't eliminate it completely, but you can reduce it a lot: retrieve well, instruct the model to answer only from sources, give it an explicit "I don't know" option, require citations, and test with questions that have no answer in your docs.

## Key takeaways

- RAG quality is mostly retrieval quality — debug what you retrieve first.
- Store source metadata so you can cite and debug.
- Give the model clear sources, clear rules, and permission to say "I don't know."
- Build a small evaluation set early and re-run it after every change.

If you'd like a RAG chatbot built on your own documents, or want help fixing one that gives wrong answers, [get in touch](/contact) — I'm happy to take a look.

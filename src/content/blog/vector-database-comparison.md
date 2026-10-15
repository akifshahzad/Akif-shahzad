Picking a vector database for RAG is one of the first real decisions you make when you move an AI feature past the prototype stage. In this post I compare Pinecone, Chroma, and pgvector, the three options I see most often in client projects, and explain how I choose between them.

## What a vector database actually does

A retrieval-augmented generation (RAG) pipeline works like this. You split your documents into chunks, turn each chunk into an embedding (a list of numbers that captures its meaning), and store those embeddings. When a user asks a question, you embed the question too, find the chunks whose embeddings are closest to it, and pass those chunks to the LLM as context.

The vector database handles the "find the closest chunks" step. Underneath, it does three things:

- **Stores vectors** next to an ID and some metadata (source file, user ID, date, and so on).
- **Runs similarity search** using a distance metric like cosine distance or inner product.
- **Uses an approximate nearest neighbour (ANN) index** such as HNSW, so it doesn't have to compare the query against every row.

Almost every option does all three. They differ in **where the data lives, who runs it, and how well it fits with the rest of your stack**.

## The three models

### Pinecone: fully managed

Pinecone is a hosted service. You create an index, send vectors over an API, and query it. You never manage servers, memory, or index tuning. It supports metadata filtering, namespaces for separating tenants, and a serverless mode that scales on its own.

```python
from pinecone import Pinecone

pc = Pinecone(api_key="YOUR_API_KEY")
index = pc.Index("docs")

results = index.query(
    vector=query_embedding,
    top_k=5,
    filter={"source": {"$eq": "handbook"}},
    include_metadata=True,
)
```

The trade-off is that your vectors now live in a separate system from your application data. You have to keep the two in sync, and you add another vendor, another set of credentials, and another network hop.

### Chroma: embedded and local-first

Chroma is open source and runs inside your Python process by default, saving to a local folder. That makes it the quickest way to get a RAG prototype working. Install a package and you're storing embeddings within a minute. It can also run as a separate server, and there's a hosted cloud version if you outgrow running it yourself.

```python
import chromadb

client = chromadb.PersistentClient(path="./chroma")
collection = client.get_or_create_collection("docs")

collection.add(
    ids=["doc-1", "doc-2"],
    documents=["Refunds are processed within 5 days.", "Support is open on weekdays."],
    metadatas=[{"source": "faq"}, {"source": "faq"}],
)

results = collection.query(
    query_texts=["How long do refunds take?"],
    n_results=5,
    where={"source": "faq"},
)
```

By default Chroma embeds text with a built-in model. In production I usually pass my own embeddings so I control the model and can use the same one in every environment.

### pgvector: a Postgres extension

pgvector adds a `vector` column type and distance operators to PostgreSQL. Your embeddings sit in the same database as your users, documents, and permissions, and you query them with SQL. Most managed Postgres providers support it, including Supabase, Neon, AWS RDS, and Google Cloud SQL.

## Comparison table

| | Pinecone | Chroma | pgvector |
|---|---|---|---|
| Hosting | Managed SaaS only | Embedded, self-hosted server, or cloud | Wherever your Postgres runs |
| Ops effort | Very low | Very low locally, moderate as a server | Low if you already run Postgres |
| Metadata filtering | Built-in filter syntax | `where` filters on metadata | Full SQL: joins, `WHERE`, row-level security |
| Data lives with app data | No | No | Yes |
| Best for | Large or fast-growing vector workloads where you don't want to run anything | Prototypes, notebooks, local tools, small apps | Production apps that already use Postgres |

## A practical pgvector example

Here's the setup I start with on most projects. It assumes 1536-dimension embeddings, which matches OpenAI's `text-embedding-3-small`.

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
  id          BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  workspace_id BIGINT NOT NULL,
  content     TEXT NOT NULL,
  embedding   vector(1536) NOT NULL
);

CREATE INDEX ON document_chunks
  USING hnsw (embedding vector_cosine_ops);

CREATE INDEX ON document_chunks (workspace_id);
```

To query it, pass the question's embedding as a parameter. The `<=>` operator is cosine distance, so smaller means more similar.

```sql
SELECT id, content, 1 - (embedding <=> $1) AS similarity
FROM document_chunks
WHERE workspace_id = $2
ORDER BY embedding <=> $1
LIMIT 5;
```

A few details that matter:

- **Match the operator class to the operator.** `vector_cosine_ops` goes with `<=>`. If you use `<->` (L2) or `<#>` (negative inner product), you need `vector_l2_ops` or `vector_ip_ops`, or the index won't be used.
- **Filtering and ANN indexes interact.** With a selective `WHERE` clause, an HNSW scan can return fewer rows than your `LIMIT`. Recent pgvector versions (0.8+) add iterative index scans (`SET hnsw.iterative_scan = relaxed_order;`) to handle this. For strict multi-tenant isolation, a B-tree index on the tenant column helps too.
- **Check the plan.** Run `EXPLAIN ANALYZE` on your real query to confirm the HNSW index is being used.

From Node.js the same query works with the `pg` driver. Serialise the embedding as a string like `'[0.1,0.2,...]'` with `JSON.stringify(embedding)`, or use the `pgvector` npm package, which handles the conversion.

## My default recommendation

**If the project already uses Postgres, I start with pgvector.** That covers most of the apps I build, since they're usually Next.js or FastAPI on top of Postgres anyway. The reasons:

- One database to back up, migrate, and secure.
- Retrieval can join against real tables, so "only search documents this user is allowed to see" is a `WHERE` clause or a row-level security policy instead of a sync job.
- Deleting a document deletes its chunks through `ON DELETE CASCADE`. You don't end up with orphan vectors in a second system.

**I use Chroma for prototypes and local tools.** When I'm testing chunking strategies or embedding models in a notebook, I don't want to set up a database. Chroma lets me try ideas quickly. Once the approach is settled, I move the data into pgvector.

**I recommend Pinecone when vector search is the core workload.** That means a large vector count, heavy query traffic, no existing Postgres, or a team that doesn't want to tune indexes. Paying for a managed service is a reasonable trade there.

Honestly, for most RAG apps the vector store isn't what limits answer quality. Chunking, embedding model choice, metadata filtering, and re-ranking usually matter more. Pick the option that fits your stack, then spend your time on retrieval quality. For the full pipeline, see [how to build a RAG chatbot in Python](/blog/how-to-build-a-rag-chatbot-python).

## FAQ

### Is pgvector good enough for production RAG?

For most applications, yes. With an HNSW index it handles typical RAG workloads well, and you get transactions, backups, and access control from Postgres for free. If you expect a very large vector count or very high query volume, benchmark against your own data before you commit.

### Can I switch vector databases later?

Yes, as long as you keep your source text and embeddings reproducible. Store the original chunk text and the embedding model name alongside each vector. Migrating then means re-inserting (or re-embedding) the data and rewriting a thin retrieval function. Wrap your vector store behind one function like `searchChunks(query, filters)` from the start.

### What's the difference between HNSW and IVFFlat in pgvector?

Both are approximate indexes. HNSW usually gives better speed and recall and can be built on an empty table, but it uses more memory and takes longer to build. IVFFlat builds faster and uses less memory, but it needs data in the table first to choose its clusters, and recall depends on tuning `lists` and `probes`. I default to HNSW.

If you're planning a RAG feature and want help choosing the stack or building the retrieval pipeline, take a look at [my services](/services) or [get in touch](/contact).

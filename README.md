# Personalized learning platform — backend MVP

A working FastAPI backend covering the first half of the pipeline we designed:
**upload → parse & chunk → extract concepts (LLM) → index for RAG → answer
questions → generate quizzes**.

Knowledge tracing, the recommendation/study-plan engine, and the Obsidian
export weren't in scope for this pass — see "What's not built yet" below for
how they'd plug into what's here.

## Quickstart

```bash
python -m venv venv && source venv/bin/activate   # or your usual env manager
pip install -r requirements.txt

cp .env.example .env
# edit .env and add your GEMINI_API_KEY (optional — see "mock mode" below)

uvicorn app.main:app --reload
# API docs: http://127.0.0.1:8000/docs
```

Or run the pipeline directly without the server, against the bundled sample
lecture text:

```bash
python scripts/demo_pipeline.py
```

In a second terminal, start the frontend:

bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
# http://localhost:3000


## Live mode vs. mock mode

Every LLM-dependent step (concept extraction, quiz generation, RAG answers)
goes through `app/llm_client.py`. If `GEMINI_API_KEY` is set, it calls the
real Gemini API. If not, it falls back to rough offline heuristics —
frequency-based term extraction instead of real concept extraction, template
questions instead of generated ones, "closest matching excerpt" instead of a
synthesized answer.

Mock mode exists so the plumbing (parsing, chunking, DB, retrieval, routing)
is testable with zero setup. **It is not a substitute for the real thing —
add your API key for actual concept/quiz quality.**

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/documents/upload` | Upload a PDF / PPTX / txt / md file. Parses, chunks, extracts concepts, and indexes it for RAG in one call. |
| GET | `/documents/{id}` | Document status (`processing` / `ready` / `failed`). |
| GET | `/documents/{id}/concepts` | Concepts extracted from the document. |
| POST | `/chat/ask` | Ask a question; answered via RAG over that document's chunks. |
| POST | `/quiz/concepts/{concept_id}/generate?n=3` | Generate quiz questions for one concept. |
| POST | `/quiz/submit` | Submit an answer; graded and logged as a `QuizAttempt`. |

### Uploading PDFs

Upload a text-based PDF from the Student dashboard. The API saves it, extracts
text page by page, chunks it, extracts concepts, builds the retrieval index,
and then makes it available for chat and quiz generation. Scanned/image-only
PDFs need OCR before upload; the API reports that clearly rather than creating
an empty document.

## Architecture notes / deliberate MVP shortcuts

- **Retrieval uses TF-IDF, not embeddings.** `app/vectorstore.py` is a small
  in-memory, lexical-overlap search — no external embedding API or model
  download required, so it runs anywhere. Swap in `sentence-transformers`,
  Voyage AI, or OpenAI embeddings plus a real vector DB (pgvector, Pinecone,
  Weaviate, Chroma) for semantic retrieval quality.
- **The vector index is in-memory** (`_STORES` dict in `app/services/rag.py`),
  keyed by document id. Fine for an MVP; doesn't survive a restart. Persist
  it alongside the embeddings in production.
- **Run a single API worker for this MVP.** With multiple Uvicorn workers,
  each process maintains its own in-memory retrieval cache and rebuilds it
  independently. Use a persistent vector store before horizontal scaling.
- **Short-answer grading is a loose string-containment check**
  (`app/services/quiz.py`). Replace with an LLM-as-grader call for real
  semantic grading.
- **No auth / multi-tenancy.** Every quiz attempt defaults to
  `student_id="demo-student"`. Add real user accounts before this goes near
  real students.

## What's not built yet (and where it hooks in)

- **Knowledge tracing (BKT/DKT):** `QuizAttempt` already logs
  `(concept, correct/incorrect, timestamp)` for every submission — that's
  the exact input a Bayesian or Deep Knowledge Tracing model needs. Build
  it as a service that reads from that table and outputs a per-concept
  mastery score.
- **Recommendation / study plan engine:** would consume the mastery scores
  above plus `Concept.prerequisites` to sequence what to review next.
- **Obsidian vault export:** would read the `Concept` table (name,
  definition, prerequisites) and render each row as a markdown note with
  `[[wikilinks]]` for prerequisite relationships — the data model already
  has everything needed, it's a rendering step away.

## Project layout

app/
  main.py              FastAPI app + router registration
  config.py            Settings (API key, DB url, chunk size, etc.)
  database.py           SQLAlchemy models: Document, Chunk, Concept, QuizQuestion, QuizAttempt
  schemas.py            Pydantic request/response models
  llm_client.py          Gemini wrapper (live + mock modes)
  vectorstore.py         TF-IDF retrieval store
  services/
    ingestion.py          PDF/PPTX/text parsing + chunking
    extraction.py          Concept extraction, de-duped per document
    rag.py                 Index + answer questions over a document
    quiz.py                Quiz generation + grading
    analytics.py            Per-concept quiz accuracy aggregation (powers educator view)
  routers/
    documents.py, quiz.py, chat.py    HTTP endpoints
scripts/
  demo_pipeline.py        Runs the whole pipeline without the server
sample_data/
  sample_lecture.txt      Sample text to test against
frontend/
  app/                     Next.js pages: landing, /student, /educator
  components/              UploadPanel, DocumentList, ConceptList, QuizPanel,
                            ChatPanel, AnalyticsTable, ConceptMap
  lib/                     api.ts (typed fetch client), types.ts
  README.md                Frontend-specific setup and design notes

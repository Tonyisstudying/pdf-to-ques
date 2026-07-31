from sqlalchemy.orm import Session

from .. import database as db
from ..config import settings
from ..llm_client import LLMClient
from ..vectorstore import InMemoryVectorStore

# document_id -> fitted vector store. In-memory and rebuilt on ingestion;
# fine for an MVP, but doesn't survive a server restart. Do not deploy this
# version with multiple workers: each process has its own cache and performs a
# cold rebuild from SQLite independently. Use one worker until Layer 4 adds a
# persistent vector database.
_STORES: dict[int, InMemoryVectorStore] = {}


def index_document(document: db.Document) -> None:
    store = InMemoryVectorStore()
    ids = [c.id for c in document.chunks]
    texts = [c.text for c in document.chunks]
    store.build(ids, texts)
    _STORES[document.id] = store


def answer_question(
    session: Session, document_id: int, question: str, llm: LLMClient, top_k: int | None = None
) -> tuple[str, list[str]]:
    top_k = top_k or settings.rag_top_k
    store = _STORES.get(document_id)
    if store is None:
        document = session.get(db.Document, document_id)
        if document is None:
            return "That document doesn't exist.", []
        index_document(document)
        store = _STORES[document_id]

    results = store.search(question, top_k=top_k)
    context_chunks = [text for _, text, _ in results]
    answer = llm.answer_with_context(question, context_chunks)
    return answer, context_chunks

from sqlalchemy.orm import Session

from .. import database as db
from ..llm_client import LLMClient


def extract_and_store_concepts(session: Session, document: db.Document, llm: LLMClient) -> list[db.Concept]:
    """Runs concept extraction per chunk and de-dupes by concept name across
    the whole document. Returns the newly created Concept rows."""
    seen: dict[str, db.Concept] = {}
    for chunk in document.chunks:
        for raw in llm.extract_concepts(chunk.text):
            name = (raw.get("name") or "").strip()
            if not name or name in seen:
                continue
            concept = db.Concept(
                document_id=document.id,
                name=name,
                definition=raw.get("definition", ""),
                source_chunk_id=chunk.id,
                prerequisites=raw.get("prerequisites", []),
            )
            session.add(concept)
            seen[name] = concept
    session.commit()
    return list(seen.values())

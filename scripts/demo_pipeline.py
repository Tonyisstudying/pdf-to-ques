"""End-to-end demo of ingest -> extract -> RAG -> quiz, without needing the
FastAPI server running. Good for a quick sanity check of the pipeline.

Run from the project root:
    python scripts/demo_pipeline.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.database import SessionLocal, init_db, Document, Chunk
from backend.app.llm_client import LLMClient
from backend.app.services import ingestion, extraction, rag
from backend.app.services import quiz as quiz_service


def main():
    init_db()
    session = SessionLocal()
    llm = LLMClient()
    mode = "MOCK (no DEEPSEEK_API_KEY set)" if llm.mock_mode else "LIVE"
    print(f"LLM mode: {mode}\n")

    sample_path = Path(__file__).resolve().parent.parent / "sample_data" / "sample_lecture.txt"
    text = ingestion.extract_text(str(sample_path))
    chunks = ingestion.chunk_text(text)
    print(f"Parsed {len(text)} chars into {len(chunks)} chunk(s)\n")

    document = Document(filename=sample_path.name, status="processing")
    session.add(document)
    session.commit()
    session.refresh(document)

    for i, chunk_text in enumerate(chunks):
        session.add(Chunk(document_id=document.id, chunk_index=i, text=chunk_text))
    session.commit()
    session.refresh(document)

    concepts = extraction.extract_and_store_concepts(session, document, llm)
    print(f"Extracted {len(concepts)} concept(s):")
    for c in concepts:
        print(f"  - {c.name}: {c.definition[:90]}")
    print()

    rag.index_document(document)
    question = "What is backpropagation used for in training a neural network?"
    answer, sources = rag.answer_question(session, document.id, question, llm)
    print(f"Q: {question}")
    print(f"A: {answer}")
    print(f"   (retrieved {len(sources)} source chunk(s))\n")

    if concepts:
        target = concepts[0]
        questions = quiz_service.generate_quiz_for_concept(session, target, llm, n=2)
        print(f"Generated {len(questions)} quiz question(s) for '{target.name}':")
        for q in questions:
            print(f"  [{q.question_type}] {q.question_text}")
            if q.options:
                print(f"    options: {q.options}")
            print(f"    correct answer: {q.correct_answer}")

    document.status = "ready"
    session.commit()
    print(f"\nDone. document status = {document.status}")


if __name__ == "__main__":
    main()

import shutil
from pathlib import Path
from uuid import uuid4
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from .. import database as db
from ..database import SessionLocal
from ..llm_client import LLMClient
from ..schemas import ConceptAnalyticsOut, ConceptOut, DocumentOut
from ..services import ingestion, extraction, rag

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
SUPPORTED_EXTENSIONS = {".pdf", ".pptx", ".txt", ".md"}

def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def get_llm():
    return LLMClient()

def sanitize_upload_filename(filename: str | None) -> str:
    """Return a display-safe filename without trusting client path segments."""
    name = Path((filename or "").replace("\\", "/")).name
    if not name or name in {".", ".."} or name.startswith("."):
        raise HTTPException(status_code=400, detail="The uploaded file needs a non-hidden filename.")
    return name

@router.get("/", response_model=list[DocumentOut])
def list_documents(session: Session = Depends(get_session)):
    """Return newest uploads first for the student and educator dashboards."""
    return session.query(db.Document).order_by(db.Document.uploaded_at.desc()).all()

@router.post("/upload", response_model=DocumentOut)
def upload_document(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    llm: LLMClient = Depends(get_llm),
):
    original_filename = sanitize_upload_filename(file.filename)
    extension = Path(original_filename).suffix.lower()
    if not original_filename or extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail="Upload a PDF, PowerPoint (.pptx), text (.txt), or Markdown (.md) file.",
        )

    # Never use a browser-provided filename as a filesystem path or allow one
    # upload to replace another with the same name.
    dest = UPLOAD_DIR / f"{uuid4().hex}{extension}"
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    document = db.Document(filename=original_filename, status="processing")
    session.add(document)
    session.commit()
    session.refresh(document)

    try:
        text = ingestion.extract_text(str(dest))
        chunks = ingestion.chunk_text(text)
        if not chunks:
            raise ValueError("No readable content was found in the uploaded file.")
        for i, chunk_text in enumerate(chunks):
            session.add(db.Chunk(document_id=document.id, chunk_index=i, text=chunk_text))
        session.commit()
        session.refresh(document)

        extraction.extract_and_store_concepts(session, document, llm)
        rag.index_document(document)

        document.status = "ready"
        session.commit()
    except Exception as e:
        document.status = "failed"
        session.commit()
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

    session.refresh(document)
    return document

@router.get("/{document_id}", response_model=DocumentOut)
def get_document(document_id: int, session: Session = Depends(get_session)):
    document = session.get(db.Document, document_id)
    if not document:
        raise HTTPException(404, "Document not found")
    return document

@router.get("/{document_id}/concepts", response_model=list[ConceptOut])
def get_concepts(document_id: int, session: Session = Depends(get_session)):
    document = session.get(db.Document, document_id)
    if not document:
        raise HTTPException(404, "Document not found")
    return document.concepts


@router.get("/{document_id}/analytics", response_model=list[ConceptAnalyticsOut])
def get_analytics(document_id: int, session: Session = Depends(get_session)):
    document = session.get(db.Document, document_id)
    if not document:
        raise HTTPException(404, "Document not found")

    analytics = []
    for concept in document.concepts:
        questions = concept.quiz_questions
        attempts = [attempt for question in questions for attempt in question.attempts]
        correct_count = sum(attempt.is_correct for attempt in attempts)
        attempt_count = len(attempts)
        analytics.append(
            ConceptAnalyticsOut(
                concept_id=concept.id,
                concept_name=concept.name,
                prerequisites=concept.prerequisites or [],
                question_count=len(questions),
                attempt_count=attempt_count,
                correct_count=correct_count,
                accuracy=correct_count / attempt_count if attempt_count else None,
            )
        )
    return analytics

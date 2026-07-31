from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..llm_client import LLMClient
from ..schemas import AskRequest, AskResponse
from ..services import rag
from .documents import get_session, get_llm

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/ask", response_model=AskResponse)
def ask_question(
    request: AskRequest, session: Session = Depends(get_session), llm: LLMClient = Depends(get_llm)
):
    answer, sources = rag.answer_question(session, request.document_id, request.question, llm)
    return AskResponse(answer=answer, sources=sources)

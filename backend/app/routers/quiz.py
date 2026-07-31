from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .. import database as db
from ..llm_client import LLMClient
from ..schemas import QuizQuestionOut, QuizSubmission, QuizResult
from ..services import quiz as quiz_service
from .documents import get_session, get_llm

router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.post("/concepts/{concept_id}/generate", response_model=list[QuizQuestionOut])
def generate_quiz(
    concept_id: int, n: int = 3, session: Session = Depends(get_session), llm: LLMClient = Depends(get_llm)
):
    concept = session.get(db.Concept, concept_id)
    if not concept:
        raise HTTPException(404, "Concept not found")
    return quiz_service.generate_quiz_for_concept(session, concept, llm, n=n)

@router.post("/submit", response_model=QuizResult)
def submit_answer(submission: QuizSubmission, session: Session = Depends(get_session)):
    question = session.get(db.QuizQuestion, submission.question_id)
    if not question:
        raise HTTPException(404, "Question not found")

    is_correct = quiz_service.grade_submission(question, submission.student_answer)
    session.add(db.QuizAttempt(
        quiz_question_id=question.id,
        student_id=submission.student_id,
        is_correct=is_correct,
        submitted_answer=submission.student_answer,
    ))
    session.commit()

    return QuizResult(question_id=question.id, is_correct=is_correct, correct_answer=question.correct_answer)

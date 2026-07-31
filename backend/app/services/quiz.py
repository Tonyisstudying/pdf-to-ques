from sqlalchemy.orm import Session

from .. import database as db
from ..llm_client import LLMClient


def generate_quiz_for_concept(
    session: Session, concept: db.Concept, llm: LLMClient, n: int = 3
) -> list[db.QuizQuestion]:
    questions = []
    for raw in llm.generate_quiz_questions(concept.name, concept.definition, n=n):
        question_type = raw.get("question_type", "short_answer")
        options = raw.get("options")
        correct_answer = raw.get("correct_answer", "")
        if question_type == "mcq":
            if not isinstance(options, list) or not all(isinstance(option, str) and option.strip() for option in options):
                continue
            options = [option.strip() for option in options]
            # Persist the canonical option text so exact MCQ grading stays
            # meaningful even if a model varies capitalization or whitespace.
            matching_option = next(
                (option for option in options if option.casefold() == str(correct_answer).strip().casefold()),
                None,
            )
            if matching_option is None:
                continue
            correct_answer = matching_option
        question = db.QuizQuestion(
            concept_id=concept.id,
            question_type=question_type,
            question_text=raw.get("question_text", ""),
            options=options,
            correct_answer=correct_answer,
            difficulty=raw.get("difficulty", "medium"),
        )
        session.add(question)
        questions.append(question)
    session.commit()
    return questions


def grade_submission(question: db.QuizQuestion, student_answer: str) -> bool:
    """MCQ: exact match. Short answer: loose containment check for the MVP -
    swap this for an LLM-as-grader call for real semantic matching."""
    correct = (question.correct_answer or "").strip().lower()
    given = student_answer.strip().lower()
    if question.question_type == "mcq":
        return given == correct
    return given in correct or correct in given

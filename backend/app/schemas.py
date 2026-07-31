from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: int
    filename: str
    status: str

    class Config:
        from_attributes = True


class ConceptOut(BaseModel):
    id: int
    name: str
    definition: str
    prerequisites: list[str] = []

    class Config:
        from_attributes = True


class ConceptAnalyticsOut(BaseModel):
    concept_id: int
    concept_name: str
    prerequisites: list[str] = []
    question_count: int
    attempt_count: int
    correct_count: int
    accuracy: float | None


class QuizQuestionOut(BaseModel):
    id: int
    concept_id: int
    question_type: str
    question_text: str
    options: list[str] | None = None
    difficulty: str

    class Config:
        from_attributes = True


class QuizSubmission(BaseModel):
    question_id: int
    student_answer: str
    student_id: str = "demo-student"


class QuizResult(BaseModel):
    question_id: int
    is_correct: bool
    correct_answer: str


class AskRequest(BaseModel):
    document_id: int
    question: str


class AskResponse(BaseModel):
    answer: str
    sources: list[str]

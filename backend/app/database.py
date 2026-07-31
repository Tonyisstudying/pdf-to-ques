from datetime import datetime

from sqlalchemy import (
    create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from .config import settings

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True)
    filename = Column(String, nullable=False)
    status = Column(String, default="uploaded")  # uploaded -> processing -> ready -> failed
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")
    concepts = relationship("Concept", back_populates="document", cascade="all, delete-orphan")


class Chunk(Base):
    __tablename__ = "chunks"
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    chunk_index = Column(Integer)
    text = Column(Text)

    document = relationship("Document", back_populates="chunks")


class Concept(Base):
    __tablename__ = "concepts"
    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    name = Column(String, index=True)
    definition = Column(Text)
    source_chunk_id = Column(Integer, ForeignKey("chunks.id"), nullable=True)
    prerequisites = Column(JSON, default=list)  # list of concept-name strings

    document = relationship("Document", back_populates="concepts")
    quiz_questions = relationship("QuizQuestion", back_populates="concept", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    id = Column(Integer, primary_key=True)
    concept_id = Column(Integer, ForeignKey("concepts.id"))
    question_type = Column(String)  # mcq | short_answer
    question_text = Column(Text)
    options = Column(JSON, nullable=True)
    correct_answer = Column(Text)
    difficulty = Column(String, default="medium")

    concept = relationship("Concept", back_populates="quiz_questions")
    attempts = relationship("QuizAttempt", back_populates="question", cascade="all, delete-orphan")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id = Column(Integer, primary_key=True)
    quiz_question_id = Column(Integer, ForeignKey("quiz_questions.id"))
    student_id = Column(String, default="demo-student")
    is_correct = Column(Boolean)
    submitted_answer = Column(Text)
    attempted_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("QuizQuestion", back_populates="attempts")
    # This table is the hook point for a future knowledge-tracing model
    # (BKT/DKT): it already records which concept, correct or not, and when -
    # everything a per-skill mastery model needs as input.


def init_db():
    Base.metadata.create_all(bind=engine)

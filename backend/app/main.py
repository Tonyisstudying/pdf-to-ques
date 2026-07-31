from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import documents, quiz, chat

app = FastAPI(title="Personalized Learning Platform API", version="0.1.0")

# The Next.js dashboard is served from a separate origin during development.
# Keeping this explicit prevents browsers from blocking otherwise valid API
# requests before they reach a router.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

app.include_router(documents.router)
app.include_router(quiz.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Personalized Learning Platform API"}

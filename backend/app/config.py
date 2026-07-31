import os
from io import StringIO
from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings


def load_project_env() -> None:
    """Load a local .env file saved as either UTF-8 or UTF-16.

    PowerShell commonly creates UTF-16 files, while python-dotenv assumes
    UTF-8 when Pydantic reads ``env_file`` directly. Handling the small local
    configuration file here keeps an encoding mismatch from preventing the
    entire API from starting.
    """
    path = Path(".env")
    if not path.is_file():
        return

    raw = path.read_bytes()
    try:
        contents = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        contents = raw.decode("utf-16")
    load_dotenv(stream=StringIO(contents), override=False)

load_project_env()

class Settings(BaseSettings):
    gemini_api_key: str | None = os.getenv("GEMINI_API_KEY")
    llm_model: str = "gemini-3.6-flash"
    database_url: str = "sqlite:///./learning_platform.db"

    chunk_size: int = 800      # characters per chunk (rough, paragraph-aware)
    chunk_overlap: int = 150   # characters carried into the next chunk
    rag_top_k: int = 5         # chunks retrieved per question

settings = Settings()

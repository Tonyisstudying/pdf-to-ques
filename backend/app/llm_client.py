import json
import re
from collections import Counter
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .config import settings


class LLMClient:
    """Wraps the Gemini Generate Content API for the three LLM-dependent steps in the
    pipeline: concept extraction, quiz generation, and RAG answer synthesis.

    If GEMINI_API_KEY isn't set, this falls back to simple offline
    heuristics (mock_mode=True) so the rest of the pipeline is testable
    without credentials. Swap to live mode by setting the environment variable - no
    other code needs to change.
    """

    def __init__(self):
        self.mock_mode = not settings.gemini_api_key

    def _call(self, system: str, prompt: str, max_tokens: int = 1500) -> str:
        payload = json.dumps({
            "system_instruction": {"parts": [{"text": system}]},
            "contents": [
                {"role": "user", "parts": [{"text": prompt}]},
            ],
            "generationConfig": {"maxOutputTokens": max_tokens},
        }).encode("utf-8")
        request = Request(
            f"https://generativelanguage.googleapis.com/v1beta/models/{settings.llm_model}:generateContent",
            data=payload,
            headers={
                "x-goog-api-key": settings.gemini_api_key,
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=60) as response:
                data = json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"Gemini API returned HTTP {error.code}: {detail}") from error
        except URLError as error:
            raise RuntimeError(f"Could not reach the Gemini API: {error.reason}") from error

        try:
            parts = data["candidates"][0]["content"]["parts"]
        except (KeyError, IndexError, TypeError) as error:
            raise RuntimeError("Gemini API returned an unexpected response.") from error
        content = "".join(part.get("text", "") for part in parts if isinstance(part, dict))
        if not content:
            raise RuntimeError("Gemini API returned an empty response.")
        return content

    # ---- concept extraction -------------------------------------------------

    def extract_concepts(self, chunk_text: str) -> list[dict]:
        if self.mock_mode:
            return _mock_extract_concepts(chunk_text)
        system = (
            "You extract the key academic concepts taught in a piece of course "
            "material. Return ONLY valid JSON, no prose, no markdown fences."
        )
        prompt = f"""Extract 2-6 key concepts from this text. For each concept give:
- name: short concept name
- definition: 1-2 sentence definition grounded in the text
- prerequisites: array of other concept names it depends on (empty if none/unclear)

Text:
\"\"\"{chunk_text}\"\"\"

Return a JSON array like:
[{{"name": "...", "definition": "...", "prerequisites": ["..."]}}]"""
        return _safe_json_list(self._call(system, prompt))

    # ---- quiz generation -----------------------------------------------------

    def generate_quiz_questions(self, concept_name: str, concept_definition: str, n: int = 3) -> list[dict]:
        if self.mock_mode:
            return _mock_quiz(concept_name, concept_definition, n)
        system = (
            "You write short assessment questions for a study app. "
            "Return ONLY valid JSON, no prose, no markdown fences."
        )
        prompt = f"""Concept: {concept_name}
Definition: {concept_definition}

Write {n} quiz questions testing this concept. Mix multiple-choice and short-answer.
For every multiple-choice question, use real answer text in `options`; set
`correct_answer` to the full text of exactly one option, never a letter label.
Return a JSON array like:
[{{"question_type": "mcq", "question_text": "Which process adjusts a neural network's weights after measuring prediction error?", "options": ["Backpropagation", "Data normalization", "Feature scaling", "Random initialization"], "correct_answer": "Backpropagation", "difficulty": "easy"}},
 {{"question_type": "short_answer", "question_text": "...", "options": null, "correct_answer": "...", "difficulty": "medium"}}]"""
        return _safe_json_list(self._call(system, prompt))

    # ---- RAG answer synthesis -------------------------------------------------

    def answer_with_context(self, question: str, context_chunks: list[str]) -> str:
        if self.mock_mode:
            return _mock_rag_answer(context_chunks)
        system = (
            "You answer student questions using ONLY the provided course material. "
            "If the material doesn't contain the answer, say so plainly. Cite which "
            "excerpt number you used."
        )
        context = "\n\n".join(f"[{i + 1}] {c}" for i, c in enumerate(context_chunks))
        prompt = f"Course material:\n{context}\n\nStudent question: {question}"
        return self._call(system, prompt, max_tokens=800)


# ---- JSON parsing helper --------------------------------------------------

def _safe_json_list(raw: str) -> list[dict]:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw.split("\n", 1)[-1]
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []


# ---- offline fallbacks (mock mode) -----------------------------------------

def _mock_extract_concepts(chunk_text: str) -> list[dict]:
    """Rough offline stand-in: frequency of capitalized phrases as 'concepts'.
    Nowhere near LLM quality - only here so the pipeline runs without a key."""
    words = re.findall(r"[A-Z][a-zA-Z]{3,}(?:\s[A-Z][a-zA-Z]{3,})?", chunk_text)
    counts = Counter(w for w in words if w.lower() not in {"the", "this", "that"})
    top_terms = [w for w, _ in counts.most_common(4)]

    concepts = []
    for term in top_terms:
        sentence = next((s.strip() for s in chunk_text.split(".") if term in s), "")
        concepts.append({
            "name": term,
            "definition": (sentence[:200] + "...") if sentence else f"Key term found in the material: {term}",
            "prerequisites": [],
        })
    return concepts


def _mock_quiz(concept_name: str, concept_definition: str, n: int) -> list[dict]:
    templates = [
        f"In your own words, define '{concept_name}'.",
        f"Why does '{concept_name}' matter in this material?",
        f"True or false: explain whether '{concept_name}' applies here and why.",
    ]
    return [
        {
            "question_type": "short_answer",
            "question_text": templates[i % len(templates)],
            "options": None,
            # Keep the reference answer concise so the MVP containment grader
            # can accept a reasonable student response in offline mode.
            "correct_answer": f"{concept_name} is a key concept in this material.",
            "difficulty": "medium",
        }
        for i in range(max(n, 1))
    ]


def _mock_rag_answer(context_chunks: list[str]) -> str:
    if not context_chunks:
        return "I don't have enough uploaded material to answer that yet."
    return (
        "[mock mode - no GEMINI_API_KEY set] Closest matching excerpt: "
        + context_chunks[0][:300] + "..."
    )

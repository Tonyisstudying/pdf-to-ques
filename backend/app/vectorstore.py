import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class InMemoryVectorStore:
    """Minimal TF-IDF-based vector store, scoped to one document's chunks.

    This is intentionally simple and dependency-light so the MVP runs fully
    offline with no external embedding API or model download. Swap this out
    for a real embedding model (sentence-transformers, Voyage AI, OpenAI
    embeddings) plus a proper vector DB (pgvector, Pinecone, Weaviate, Chroma)
    once you're ready for production-quality semantic retrieval - TF-IDF only
    captures lexical overlap, not meaning.
    """

    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.matrix = None
        self.ids: list[int] = []
        self.texts: list[str] = []

    def build(self, ids: list[int], texts: list[str]):
        self.ids = ids
        self.texts = texts
        if texts:
            self.matrix = self.vectorizer.fit_transform(texts)

    def search(self, query: str, top_k: int = 5) -> list[tuple[int, str, float]]:
        if self.matrix is None or not self.ids:
            return []
        query_vec = self.vectorizer.transform([query])
        sims = cosine_similarity(query_vec, self.matrix)[0]
        ranked = np.argsort(sims)[::-1][:top_k]
        return [(self.ids[i], self.texts[i], float(sims[i])) for i in ranked if sims[i] > 0]

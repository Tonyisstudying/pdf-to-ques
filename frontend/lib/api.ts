import type {
  AskResponse,
  Concept,
  ConceptAnalytics,
  Document,
  QuizQuestion,
  QuizResult,
} from "./types.ts";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function errorMessage(res: Response): Promise<string> {
  const body = await res.text();
  if (!body) return `${res.status} ${res.statusText}`;

  try {
    const parsed = JSON.parse(body) as { detail?: unknown };
    if (typeof parsed.detail === "string") return `${res.status}: ${parsed.detail}`;
  } catch {
    // Non-JSON responses are still useful as plain text below.
  }
  return `${res.status} ${res.statusText}: ${body}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }
  return res.json();
}

export async function listDocuments(): Promise<Document[]> {
  return request("/documents/");
}

export async function uploadDocument(file: File): Promise<Document> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/documents/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function getConcepts(documentId: number): Promise<Concept[]> {
  return request(`/documents/${documentId}/concepts`);
}

export async function getAnalytics(documentId: number): Promise<ConceptAnalytics[]> {
  return request(`/documents/${documentId}/analytics`);
}

export async function askQuestion(documentId: number, question: string): Promise<AskResponse> {
  return request("/chat/ask", {
    method: "POST",
    body: JSON.stringify({ document_id: documentId, question }),
  });
}

export async function generateQuiz(conceptId: number, n = 2): Promise<QuizQuestion[]> {
  return request(`/quiz/concepts/${conceptId}/generate?n=${n}`, { method: "POST" });
}

export async function submitAnswer(
  questionId: number,
  studentAnswer: string,
  studentId = "demo-student"
): Promise<QuizResult> {
  return request("/quiz/submit", {
    method: "POST",
    body: JSON.stringify({ question_id: questionId, student_answer: studentAnswer, student_id: studentId }),
  });
}

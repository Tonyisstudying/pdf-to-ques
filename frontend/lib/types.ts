export interface Document {
  id: number;
  filename: string;
  status: "uploaded" | "processing" | "ready" | "failed";
}

export interface Concept {
  id: number;
  name: string;
  definition: string;
  prerequisites: string[];
}

export interface QuizQuestion {
  id: number;
  concept_id: number;
  question_type: "mcq" | "short_answer";
  question_text: string;
  options: string[] | null;
  difficulty: string;
}

export interface QuizResult {
  question_id: number;
  is_correct: boolean;
  correct_answer: string;
}

export interface AskResponse {
  answer: string;
  sources: string[];
}

export interface ConceptAnalytics {
  concept_id: number;
  concept_name: string;
  prerequisites: string[];
  question_count: number;
  attempt_count: number;
  correct_count: number;
  accuracy: number | null;
}

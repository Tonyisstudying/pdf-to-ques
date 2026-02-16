export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  FILL_IN_BLANK = 'FILL_IN_BLANK'
}

export interface Question {
  id: number;
  type: QuestionType;
  questionText: string;
  options?: string[]; // For MCQ
  correctAnswer: string;
  explanation: string;
}

export interface QuizData {
  id: string;        // New: Unique ID for the quiz
  createdAt: number;
  title: string;
  questions: Question[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  PARSING_PDF = 'PARSING_PDF',
  GENERATING_QUIZ = 'GENERATING_QUIZ',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface UserAnswers {
  [questionId: number]: string;
}

export interface ProcessingState {
  status: AppStatus;
  message: string;
  error?: string;
}
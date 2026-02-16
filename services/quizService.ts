import { Question, QuestionType, QuizData } from "../types";

/**
 * ALGORITHMIC QUIZ GENERATOR
 * Local, rule-based approach to generating questions.
 */

const STOPWORDS = new Set([
  "the", "and", "is", "in", "to", "of", "a", "an", "for", "on", "with", "by", "it", "this", "that",
  "as", "are", "be", "or", "from", "at", "which", "was", "were", "has", "have", "but", "not", "can",
  "its", "we", "they", "their", "these", "those", "will", "about", "into", "more", "other", "such",
  "one", "all", "also", "some", "up", "out", "only", "who", "when", "where", "why", "how", "what"
]);

const shuffle = <T>(arr: T[]): T[] => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const splitSentences = (text: string): string[] => {

  let cleanText = text.replace(/\s+/g, " ").trim();
  
  const abbreviations = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Sr.", "Jr.", "vs.", "e.g.", "i.e.", "etc.", "Fig."];
  abbreviations.forEach(abbr => {
    const safe = abbr.replace('.', '{{DOT}}');
    cleanText = cleanText.split(abbr).join(safe);
  });

  const sentences = cleanText.split(/(?<=[.?!])\s+/);

  return sentences
    .map(s => s.replace(/{{DOT}}/g, '.'))
    .filter(s => s.length > 25 && s.length < 300);
};

const extractCandidates = (text: string): string[] => {
  const words = text
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .toLowerCase()
    .split(/\s+/);

  const frequency: Record<string, number> = {};

  words.forEach(word => {
    if (word.length > 4 && !STOPWORDS.has(word) && !/^\d+$/.test(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
};

const findContextSentence = (sentences: string[], token: string): string | null => {
  const regex = new RegExp(`\\b${token}\\b`, 'i');
  return sentences.find(s => regex.test(s)) || null;
};

// Update signature to accept questionCount
export const generateQuizFromText = async (text: string, questionCount: number = 5): Promise<QuizData> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const sentences = splitSentences(text);
  const candidates = extractCandidates(text);
  
  if (sentences.length === 0 || candidates.length === 0) {
     return {
       id: crypto.randomUUID(),
       createdAt: Date.now(),
       title: "Could not generate quiz",
       questions: []
     };
  }

  const questions: Question[] = [];
  const usedSentences = new Set<string>();
  
  // Use the requested count, but don't exceed available candidates
  const targetCount = Math.min(questionCount, candidates.length);
  let attempts = 0;
  let questionId = 1;

  while (questions.length < targetCount && attempts < candidates.length) {
    // ...existing code...
    // (Keep the loop logic exactly the same)
    const answer = candidates[attempts];
    attempts++;

    const sentence = findContextSentence(sentences, answer);
    
    if (!sentence || usedSentences.has(sentence)) continue;
    usedSentences.add(sentence);

    const distractors = shuffle(candidates.filter(c => c !== answer)).slice(0, 3);
    if (distractors.length < 3) continue;

    const typeRoll = Math.random();
    let q: Question | null = null;
    const answerRegex = new RegExp(`\\b${answer}\\b`, 'gi');

    if (typeRoll < 0.4) {
      const questionText = sentence.replace(answerRegex, "_______");
      q = {
        id: questionId++,
        type: QuestionType.MULTIPLE_CHOICE,
        questionText: `Complete the sentence: "${questionText}"`,
        options: shuffle([answer, ...distractors]),
        correctAnswer: answer,
        explanation: `The original text says: "${sentence}"`
      };
    } else if (typeRoll < 0.6) {
      const questionText = sentence.replace(answerRegex, "_______");
      q = {
        id: questionId++,
        type: QuestionType.FILL_IN_BLANK,
        questionText: questionText,
        correctAnswer: answer,
        explanation: `Context: "${sentence}"`
      };
    } else if (typeRoll < 0.8) {
      const isTrue = Math.random() > 0.5;
      let qText = sentence;
      let explanation = "This statement is directly from the text.";
      
      if (!isTrue) {
        qText = sentence.replace(answerRegex, distractors[0]);
        explanation = `False. The text actually says: "${sentence}"`;
      }

      q = {
        id: questionId++,
        type: QuestionType.TRUE_FALSE,
        questionText: `True or False: ${qText}`,
        correctAnswer: isTrue ? "True" : "False",
        explanation: explanation
      };
    } else {
      q = {
        id: questionId++,
        type: QuestionType.SHORT_ANSWER,
        questionText: `Based on the text, what is the key term for: "${sentence.replace(answerRegex, "[term]")}"?`,
        correctAnswer: answer,
        explanation: `The term is "${answer}". Context: ${sentence}`
      };
    }

    if (q) questions.push(q);
  }

  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    title: `Generated Quiz (${questions.length} Questions)`,
    questions
  };
};

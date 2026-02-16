import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PDFDropzone from './components/PDFDropzone';
import LoadingState from './components/LoadingState';
import QuizCard from './components/QuizCard';
import SavedQuizzes from './components/SavedQuizzes';
import { extractTextFromPDF } from './services/pdfService';
import { generateQuizFromText } from './services/quizService';
import { QuizData, ProcessingState, AppStatus, UserAnswers } from './types';
import { GraduationCap, RotateCcw, AlertTriangle } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'tony_quiz_history';
const PREF_COUNT_KEY = 'tony_pref_count';

type ViewState = 'HOME' | 'QUIZ' | 'HISTORY';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: AppStatus.IDLE,
    message: ''
  });
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [isGraded, setIsGraded] = useState(false);
  const [score, setScore] = useState(0);
  
  // New State
  const [questionCount, setQuestionCount] = useState(() => {
    const saved = localStorage.getItem(PREF_COUNT_KEY);
    return saved ? parseInt(saved, 10) : 5;
  });
  const [quizHistory, setQuizHistory] = useState<QuizData[]>([]);

  // Save preference when changed
  useEffect(() => {
    localStorage.setItem(PREF_COUNT_KEY, questionCount.toString());
  }, [questionCount]);

  // Load history on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
      try {
        setQuizHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveToHistory = (newQuiz: QuizData) => {
    const updatedHistory = [newQuiz, ...quizHistory];
    setQuizHistory(updatedHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = quizHistory.filter(q => q.id !== id);
    setQuizHistory(updatedHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to delete all saved quizzes?")) {
      setQuizHistory([]);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  };

  const handleFileSelect = async (file: File) => {
    setProcessingState({ status: AppStatus.PARSING_PDF, message: 'Tony is reading your PDF...' });

    try {
      const text = await extractTextFromPDF(file);
      
      setProcessingState({ status: AppStatus.GENERATING_QUIZ, message: `Tony is creating ${questionCount} questions tailored to you...` });
      
      // Pass questionCount to service
      const quiz = await generateQuizFromText(text, questionCount);

      if (quiz.questions.length === 0) {
        throw new Error("Tony couldn't find enough content to generate a quiz. Please try a text-heavy PDF.");
      }

      setQuizData(quiz);
      setUserAnswers({});
      setIsGraded(false);
      setScore(0);
      setProcessingState({ status: AppStatus.READY, message: '' });
      setView('QUIZ');
      
      saveToHistory(quiz);

    } catch (error: any) {
      setProcessingState({ 
        status: AppStatus.ERROR, 
        message: '', 
        error: error.message || "Something went wrong." 
      });
    }
  };

  const loadQuiz = (quiz: QuizData) => {
    setQuizData(quiz);
    setUserAnswers({});
    setIsGraded(false);
    setScore(0);
    setView('QUIZ');
    setProcessingState({ status: AppStatus.READY, message: '' });
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateScore = () => {
    if (!quizData) return;
    let correctCount = 0;
    quizData.questions.forEach(q => {
      const uAnswer = userAnswers[q.id]?.toLowerCase().trim() || '';
      const cAnswer = q.correctAnswer.toLowerCase().trim();
      if (uAnswer === cAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setIsGraded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setView('HOME');
    setProcessingState({ status: AppStatus.IDLE, message: '' });
  };

  const goHistory = () => {
    setView('HISTORY');
    setProcessingState({ status: AppStatus.IDLE, message: '' });
  };

  return (
    <div className="min-h-screen pb-20">
      <Header onHomeClick={goHome} onHistoryClick={goHistory} />

      <main className="container mx-auto px-4">
        
        {/* HOME VIEW */}
        {view === 'HOME' && processingState.status === AppStatus.IDLE && (
          <PDFDropzone 
            onFileSelect={handleFileSelect} 
            isProcessing={false}
            questionCount={questionCount}
            setQuestionCount={setQuestionCount}
          />
        )}

        {/* HISTORY VIEW */}
        {view === 'HISTORY' && (
          <SavedQuizzes 
            quizzes={quizHistory} 
            onSelectQuiz={loadQuiz} 
            onDeleteQuiz={deleteFromHistory}
            onClearHistory={clearHistory}
          />
        )}

        {/* LOADING STATES */}
        {(processingState.status === AppStatus.PARSING_PDF || processingState.status === AppStatus.GENERATING_QUIZ) && (
          <LoadingState message={processingState.message} />
        )}

        {/* ERROR STATE */}
        {processingState.status === AppStatus.ERROR && (
           <div className="w-full max-w-lg mx-auto mt-12 text-center p-8 bg-white rounded-3xl shadow-lg border-2 border-red-100 slide-up">
              <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Oops!</h3>
              <p className="text-gray-600 mb-6">{processingState.error}</p>
              <button 
                onClick={goHome}
                className="bg-[#3B82F6] text-white px-6 py-3 rounded-full font-bold hover:bg-[#2563EB] transition-colors"
              >
                Try Again
              </button>
           </div>
        )}

        {/* QUIZ VIEW */}
        {view === 'QUIZ' && processingState.status === AppStatus.READY && quizData && (
          <div className="max-w-3xl mx-auto mt-12 slide-up">
            
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1 rounded-full bg-[#60A5FA]/20 text-[#78350F] text-sm font-bold tracking-wider mb-3 border border-[#60A5FA]">
                GENERATED QUIZ
              </span>
              <h2 className="text-4xl font-bold text-[#4A2016] mb-4 serif-font leading-tight">
                {quizData.title}
              </h2>
              <p className="text-[#78350F]/70">
                Answer the questions below to test your knowledge.
              </p>
            </div>

            {isGraded && (
              <div className="bg-[#4A2016] text-[#FFF8F0] rounded-3xl p-8 mb-10 flex flex-col md:flex-row items-center justify-between shadow-xl">
                 <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="bg-[#60A5FA] p-3 rounded-full text-[#4A2016]">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Quiz Complete!</h3>
                      <p className="text-[#FFF8F0]/80">You scored {score} out of {quizData.questions.length}</p>
                    </div>
                 </div>
                 <div className="text-4xl font-bold font-serif text-[#60A5FA]">
                    {Math.round((score / quizData.questions.length) * 100)}%
                 </div>
              </div>
            )}

            <div className="space-y-6">
              {quizData.questions.map((q, index) => (
                <QuizCard
                  key={q.id}
                  index={index}
                  question={q}
                  userAnswer={userAnswers[q.id]}
                  isGraded={isGraded}
                  onAnswerChange={(val) => handleAnswerChange(q.id, val)}
                />
              ))}
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center pb-12">
               {!isGraded ? (
                 <button 
                  onClick={calculateScore}
                  className="w-full sm:w-auto bg-[#3B82F6] text-white text-lg font-bold px-12 py-4 rounded-full shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all active:translate-y-[1px]"
                 >
                   Submit Quiz
                 </button>
               ) : (
                 <>
                   <button 
                    onClick={() => { setIsGraded(false); setUserAnswers({}); setScore(0); window.scrollTo({top:0, behavior:'smooth'}); }}
                    className="w-full sm:w-auto bg-white text-[#4A2016] border-2 border-[#E5E7EB] text-lg font-bold px-8 py-4 rounded-full hover:bg-gray-50 transition-colors"
                   >
                     Try Again
                   </button>
                   <button 
                    onClick={goHome}
                    className="w-full sm:w-auto bg-[#4A2016] text-white text-lg font-bold px-8 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#2e130d] transition-colors shadow-lg"
                   >
                     <RotateCcw className="w-5 h-5" />
                     New PDF
                   </button>
                 </>
               )}
            </div>

          </div>
        )}
      </main>

      <footer className="text-center text-[#78350F]/40 py-8 text-sm font-medium">
        Made with ❤️ by Tony
      </footer>
    </div>
  );
};

export default App;

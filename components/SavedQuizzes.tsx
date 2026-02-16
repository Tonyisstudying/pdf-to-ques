import React from 'react';
import { QuizData } from '../types';
import { Clock, ChevronRight, Trash2, BookOpen } from 'lucide-react';

interface SavedQuizzesProps {
  quizzes: QuizData[];
  onSelectQuiz: (quiz: QuizData) => void;
  onDeleteQuiz: (id: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
}

const SavedQuizzes: React.FC<SavedQuizzesProps> = ({ quizzes, onSelectQuiz, onDeleteQuiz, onClearHistory }) => {
  if (quizzes.length === 0) {
    return (
      <div className="text-center mt-20 p-8">
        <div className="bg-[#60A5FA]/20 p-6 rounded-full inline-block mb-4">
          <BookOpen className="w-12 h-12 text-[#78350F]" />
        </div>
        <h3 className="text-2xl font-bold text-[#4A2016] mb-2 serif-font">No Saved Quizzes</h3>
        <p className="text-[#78350F]/70">Generate a quiz to see it here!</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4 slide-up">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[#4A2016] serif-font">Your Library</h2>
        <button 
          onClick={onClearHistory}
          className="text-sm text-red-500 hover:text-red-700 font-bold underline decoration-2 underline-offset-4"
        >
          Clear All
        </button>
      </div>
      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <div 
            key={quiz.id}
            onClick={() => onSelectQuiz(quiz)}
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-[#F3F4F6] cursor-pointer transition-all group flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-lg text-[#1F2937] mb-1 group-hover:text-[#3B82F6] transition-colors">
                {quiz.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-xs font-bold">
                  {quiz.questions.length} Qs
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => onDeleteQuiz(quiz.id, e)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Quiz"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-[#FFF8F0] flex items-center justify-center group-hover:bg-[#3B82F6] group-hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedQuizzes;
import React from 'react';
import { Question, QuestionType } from '../types';
import { MultipleChoice, TrueFalse, ShortAnswer, FillInBlank } from './QuestionTypes';
import { MessageCircle } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  index: number;
  userAnswer: string;
  isGraded: boolean;
  onAnswerChange: (val: string) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ question, index, userAnswer, isGraded, onAnswerChange }) => {
  
  const renderQuestionInput = () => {
    const props = {
      userAnswer: userAnswer || '',
      correctAnswer: question.correctAnswer,
      isGraded,
      onChange: onAnswerChange,
      options: question.options
    };

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return <MultipleChoice {...props} />;
      case QuestionType.TRUE_FALSE:
        return <TrueFalse {...props} />;
      case QuestionType.SHORT_ANSWER:
        return <ShortAnswer {...props} />;
      case QuestionType.FILL_IN_BLANK:
        return <FillInBlank {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-lg border border-[#F3F4F6] mb-8 relative overflow-hidden">
       {/* Question Number Badge */}
       <div className="absolute top-0 left-0 bg-[#60A5FA] text-[#4A2016] font-bold px-4 py-2 rounded-br-2xl text-sm">
          Question {index + 1}
       </div>

       <div className="mt-6 mb-4">
          <h3 className="text-xl font-bold text-[#1F2937] leading-relaxed">
            {question.questionText}
          </h3>
       </div>

       {renderQuestionInput()}

       {isGraded && (
         <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in duration-500">
            <div className="flex gap-3 items-start text-gray-600 bg-[#FFF8F0] p-4 rounded-xl">
               <MessageCircle className="w-5 h-5 text-[#3B82F6] mt-1 shrink-0" />
               <div>
                 <span className="font-bold text-[#4A2016] block mb-1">Tony's Explanation:</span>
                 <p className="text-sm leading-relaxed">{question.explanation}</p>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

export default QuizCard;
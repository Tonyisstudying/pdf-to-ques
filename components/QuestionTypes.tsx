import React from 'react';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';

interface BaseQuestionProps {
  userAnswer: string;
  correctAnswer: string;
  isGraded: boolean;
  onChange: (val: string) => void;
  options?: string[];
}

export const MultipleChoice: React.FC<BaseQuestionProps> = ({ userAnswer, correctAnswer, isGraded, onChange, options }) => {
  return (
    <div className="grid gap-3 mt-4">
      {options?.map((option, idx) => {
        const isSelected = userAnswer === option;
        const isCorrect = option === correctAnswer;
        
        let containerClass = "border-2 border-[#E5E7EB] hover:border-[#60A5FA]";
        let icon = <Circle className="w-5 h-5 text-gray-400" />;

        if (isGraded) {
          if (isCorrect) {
            containerClass = "border-green-500 bg-green-50";
            icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
          } else if (isSelected && !isCorrect) {
            containerClass = "border-red-500 bg-red-50";
            icon = <XCircle className="w-5 h-5 text-red-600" />;
          } else {
             containerClass = "border-gray-200 opacity-60";
          }
        } else if (isSelected) {
          containerClass = "border-[#3B82F6] bg-[#EFF6FF]";
          icon = <div className="w-5 h-5 rounded-full bg-[#3B82F6] flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>;
        }

        return (
          <button
            key={idx}
            disabled={isGraded}
            onClick={() => onChange(option)}
            className={`w-full p-4 rounded-xl flex items-center gap-3 text-left transition-all ${containerClass}`}
          >
            {icon}
            <span className={`flex-1 font-medium ${isGraded && isCorrect ? 'text-green-800' : 'text-gray-700'}`}>
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export const TrueFalse: React.FC<BaseQuestionProps> = ({ userAnswer, correctAnswer, isGraded, onChange }) => {
  const options = ["True", "False"];
  return <MultipleChoice userAnswer={userAnswer} correctAnswer={correctAnswer} isGraded={isGraded} onChange={onChange} options={options} />;
};

export const ShortAnswer: React.FC<BaseQuestionProps> = ({ userAnswer, correctAnswer, isGraded, onChange }) => {
  return (
    <div className="mt-4">
      <textarea
        disabled={isGraded}
        value={userAnswer}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here..."
        className={`w-full p-4 rounded-xl border-2 focus:outline-none focus:ring-2 min-h-[100px] resize-none
          ${isGraded 
            ? 'border-gray-300 bg-gray-50 text-gray-600' 
            : 'border-[#E5E7EB] focus:border-[#3B82F6] focus:ring-[#3B82F6]/20'
          }
        `}
      />
      {isGraded && (
        <div className="mt-3 text-sm p-3 bg-green-50 text-green-800 rounded-lg border border-green-200">
          <span className="font-bold">Correct Answer:</span> {correctAnswer}
        </div>
      )}
    </div>
  );
};

export const FillInBlank: React.FC<BaseQuestionProps> = ({ userAnswer, correctAnswer, isGraded, onChange }) => {
   return (
    <div className="mt-4">
      <div className="relative">
        <input
          type="text"
          disabled={isGraded}
          value={userAnswer}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Fill in the blank..."
          className={`w-full p-4 rounded-xl border-2 focus:outline-none focus:ring-2
            ${isGraded 
              ? (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim() 
                  ? 'border-green-500 bg-green-50 text-green-800' 
                  : 'border-red-500 bg-red-50 text-red-800')
              : 'border-[#E5E7EB] focus:border-[#3B82F6] focus:ring-[#3B82F6]/20'
            }
          `}
        />
      </div>
      {isGraded && userAnswer.toLowerCase().trim() !== correctAnswer.toLowerCase().trim() && (
        <div className="mt-2 text-sm text-green-700 font-medium pl-1">
          Answer: {correctAnswer}
        </div>
      )}
    </div>
  );
};
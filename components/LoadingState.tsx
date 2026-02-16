import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  message: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-20 text-center p-12 bg-white rounded-3xl shadow-lg slide-up border border-[#3B82F6]/10">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-[#60A5FA] rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div className="relative bg-[#3B82F6] p-4 rounded-full">
           <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
        <div className="absolute -top-2 -right-2">
           <Sparkles className="w-8 h-8 text-[#60A5FA] animate-bounce" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-[#4A2016] mb-2 serif-font">Hang tight!</h3>
      <p className="text-xl text-[#78350F] font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingState;
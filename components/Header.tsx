import React from 'react';
import { BookOpen, History } from 'lucide-react';

interface HeaderProps {
  onHomeClick: () => void;
  onHistoryClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onHistoryClick }) => {
  return (
    <header className="bg-[#3B82F6] text-white px-6 py-4 shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={onHomeClick}
        >
          <BookOpen className="w-8 h-8" strokeWidth={2.5} />
          <h1 className="text-2xl font-bold tracking-wide serif-font">
            LEARNING WITH TONY
          </h1>
        </div>
        
        <nav className="hidden sm:flex gap-6 text-sm font-bold tracking-widest items-center">
          <button onClick={onHomeClick} className="hover:text-[#60A5FA] transition-colors">HOME</button>
          <button onClick={onHistoryClick} className="flex items-center gap-2 hover:text-[#60A5FA] transition-colors">
            <History className="w-4 h-4" />
            HISTORY
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
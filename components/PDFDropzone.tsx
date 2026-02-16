import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, ArrowRight, Settings2 } from 'lucide-react';

interface PDFDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  questionCount: number;
  setQuestionCount: (count: number) => void;
}

const PDFDropzone: React.FC<PDFDropzoneProps> = ({ onFileSelect, isProcessing, questionCount, setQuestionCount }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert("Please drop a PDF file!");
      }
    }
  }, [onFileSelect, isProcessing]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 px-4 slide-up">
      <div 
        className={`
          relative overflow-hidden rounded-[40px] p-10 text-center transition-all duration-300
          ${isDragging ? 'scale-[1.02] shadow-2xl' : 'shadow-xl hover:shadow-2xl hover:scale-[1.01]'}
          bg-gradient-to-br from-[#93C5FD] via-[#DBEAFE] to-[#DBEAFE]
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="absolute inset-4 border-[3px] border-dashed border-[#78350F] opacity-20 rounded-[32px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px]">
          
          <div className="bg-white/80 p-6 rounded-full mb-6 shadow-sm backdrop-blur-sm">
             <UploadCloud className="w-16 h-16 text-[#3B82F6]" />
          </div>

          <h2 className="text-4xl text-[#4A2016] font-bold mb-4 serif-font">
            PDFer
          </h2>
          
          <p className="text-[#78350F] text-lg font-medium mb-8 max-w-md">
            Drag your PDF lecture notes, textbooks, or research papers here. Tony will read them for you.
          </p>

          {/* Question Count Slider */}
          <div className="w-full max-w-xs mb-8 bg-white/50 p-4 rounded-2xl backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2 text-[#4A2016] font-bold text-sm">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                <span>Questions</span>
              </div>
              <span className="bg-[#3B82F6] text-white px-2 py-0.5 rounded-md text-xs">{questionCount}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={questionCount} 
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full h-2 bg-[#4A2016]/10 rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
            />
            <div className="flex justify-between text-[10px] text-[#78350F]/60 mt-1 font-bold">
              <span>1</span>
              <span>20</span>
            </div>
          </div>

          <label className={`
            group relative inline-flex items-center gap-3 px-8 py-4 
            bg-[#4A2016] text-[#FFF8F0] rounded-full text-lg font-bold 
            cursor-pointer transition-transform active:scale-95 hover:bg-[#2e130d]
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            <span>{isProcessing ? 'Reading...' : 'Choose a File'}</span>
            {!isProcessing && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleFileInput}
              disabled={isProcessing}
            />
          </label>
          
          {/* ...existing code... */}
          <div className="mt-8 flex items-center gap-2 text-[#78350F]/60 text-sm font-medium">
             <FileText className="w-4 h-4" />
             <span>Max file size: 50MB</span>
          </div>
          
          <div className="absolute top-10 right-10 text-[#78350F]/10 transform rotate-12">
            <UploadCloud className="w-32 h-32" />
          </div>
          <div className="absolute bottom-10 left-10 text-[#78350F]/10 transform -rotate-12">
            <FileText className="w-24 h-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFDropzone;
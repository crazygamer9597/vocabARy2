import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

interface WordCardProps {
  object: {
    name: string;
    translation: string;
    confidence: number;
    categories: string[];
    pronunciation?: string;
  };
  onMarkAsLearned: () => void;
  isLearned: boolean;
}

export default function WordCard({ object, onMarkAsLearned, isLearned }: WordCardProps) {
  const { 
    selectedLanguage, 
    addLearnedWord, 
    setIsLearningProgressOpen 
  } = useApp();
  
  const handleMarkAsLearned = async () => {
    if (isLearned || !selectedLanguage) return;
    
    await addLearnedWord(
      object.name,
      object.translation,
      selectedLanguage.id
    );
    
    onMarkAsLearned();
    
    // Show the learning progress modal
    setTimeout(() => {
      setIsLearningProgressOpen(true);
    }, 800);
  };
  
  return (
    <div className="word-card-appear absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg p-4 w-64 backdrop-blur-sm border-2" style={{ borderColor: '#8F87F1' }}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-white text-xs font-bold px-2 py-1 rounded" style={{ background: 'linear-gradient(90deg, #8F87F1, #C68EFD)' }}>DETECTED</span>
        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="More options">
          <span className="material-icons text-base">more_vert</span>
        </button>
      </div>
      <h3 className="text-gray-800 dark:text-white text-xl font-bold mb-1">{object.name}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {object.categories.map((category, index) => (
          <span key={index} className="text-white text-xs px-2 py-1 rounded" 
                style={{ background: index % 2 === 0 ? '#C68EFD' : '#E9A5F1' }}>
            {category}
          </span>
        ))}
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">English:</span>
          <span className="text-gray-800 dark:text-white font-medium">{object.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{selectedLanguage?.name || 'Translation'}:</span>
          <span className="font-medium" style={{ color: '#8F87F1' }}>{object.translation}</span>
        </div>
        {object.pronunciation && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Pronunciation:</span>
            <span className="font-medium" style={{ color: '#C68EFD' }}>{object.pronunciation}</span>
          </div>
        )}
      </div>
      <button 
        className={`mt-2 w-full text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center`}
        style={{ 
          background: isLearned 
            ? 'linear-gradient(90deg, #10B981, #34D399)' 
            : 'linear-gradient(90deg, #8F87F1, #C68EFD)'
        }}
        onClick={handleMarkAsLearned}
        disabled={isLearned}
      >
        <span className="material-icons text-sm mr-1">
          {isLearned ? 'check_circle' : 'check'}
        </span>
        {isLearned ? 'Word Learned' : 'Mark as Learned'}
      </button>
    </div>
  );
}

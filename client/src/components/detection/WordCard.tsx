import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playWordPronunciation } from '@/lib/pronunciationAudio';

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
  
  const [isPlaying, setIsPlaying] = useState(false);
  
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
  
  const handlePlayPronunciation = async (text: string, isOriginal: boolean = false) => {
    if (isPlaying) return;
    
    try {
      setIsPlaying(true);
      
      // Play pronunciation using the browser's speech synthesis
      // For original word (English), use 'en-US', otherwise use the selected language code
      const langCode = isOriginal ? 'en' : selectedLanguage?.code || 'en';
      await playWordPronunciation(text, langCode);
    } catch (error) {
      console.error('Error playing pronunciation:', error);
    } finally {
      setIsPlaying(false);
    }
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
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">English:</span>
          <div className="flex items-center">
            <span className="text-gray-800 dark:text-white font-medium mr-2">{object.name}</span>
            <button 
              onClick={() => handlePlayPronunciation(object.name, true)}
              disabled={isPlaying}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Play English pronunciation"
            >
              <span className="material-icons text-sm">
                {isPlaying ? 'volume_up' : 'volume_up'}
              </span>
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">{selectedLanguage?.name || 'Translation'}:</span>
          <div className="flex items-center">
            <span className="font-medium mr-2" style={{ color: '#8F87F1' }}>{object.translation}</span>
            <button 
              onClick={() => handlePlayPronunciation(object.translation)}
              disabled={isPlaying || !selectedLanguage}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={`Play ${selectedLanguage?.name || 'translation'} pronunciation`}
            >
              <span className="material-icons text-sm">
                {isPlaying ? 'volume_up' : 'volume_up'}
              </span>
            </button>
          </div>
        </div>
        {object.pronunciation && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Pronunciation:</span>
            <span className="font-medium" style={{ color: '#C68EFD' }}>{object.pronunciation}</span>
          </div>
        )}
      </div>
      
      {/* Pronunciation controls for mobile (larger target area) */}
      <div className="flex justify-between mb-4 md:hidden">
        <button
          onClick={() => handlePlayPronunciation(object.name, true)}
          disabled={isPlaying}
          className="flex items-center justify-center px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 text-sm"
        >
          <span className="material-icons text-sm mr-1">volume_up</span>
          English
        </button>
        
        <button
          onClick={() => handlePlayPronunciation(object.translation)}
          disabled={isPlaying || !selectedLanguage}
          className="flex items-center justify-center px-3 py-1 rounded-lg"
          style={{ 
            background: 'linear-gradient(90deg, #8F87F140, #C68EFD40)',
            color: '#8F87F1'
          }}
        >
          <span className="material-icons text-sm mr-1">volume_up</span>
          {selectedLanguage?.name || 'Translation'}
        </button>
      </div>
      
      <button 
        className={`w-full text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center`}
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

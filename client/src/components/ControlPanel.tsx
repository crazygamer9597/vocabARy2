import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function ControlPanel() {
  const { 
    setIsLanguageSelectorOpen,
    learnedWordsCount
  } = useApp();
  
  const [learningModeEnabled, setLearningModeEnabled] = useState(true);
  
  const toggleLearningMode = () => {
    setLearningModeEnabled(!learningModeEnabled);
  };
  
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-white font-bold">Learning Mode</h2>
            <p className="text-gray-300 text-sm">Scan objects around you</p>
          </div>
          <button 
            className="relative w-14 h-7 bg-gray-800 rounded-full"
            onClick={toggleLearningMode}
          >
            <div 
              className={`absolute left-1 top-1 w-5 h-5 bg-primary rounded-full transition-transform ${
                learningModeEnabled ? 'translate-x-7' : ''
              }`}
            ></div>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Language Selector Button */}
          <button 
            className="bg-white/5 hover:bg-white/10 rounded-xl p-2 flex flex-col items-center justify-center transition-colors"
            onClick={() => setIsLanguageSelectorOpen(true)}
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-1">
              <span className="material-icons text-white">language</span>
            </div>
            <span className="text-xs text-white">Languages</span>
          </button>
          
          {/* Words Collection Button */}
          <button className="bg-white/5 hover:bg-white/10 rounded-xl p-2 flex flex-col items-center justify-center transition-colors relative">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-1">
              <span className="material-icons text-white">auto_stories</span>
            </div>
            <span className="text-xs text-white">My Words</span>
            <span className="absolute top-2 right-2 w-4 h-4 bg-secondary rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {learnedWordsCount}
            </span>
          </button>
          
          {/* Settings Button */}
          <button className="bg-white/5 hover:bg-white/10 rounded-xl p-2 flex flex-col items-center justify-center transition-colors">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-1">
              <span className="material-icons text-white">settings</span>
            </div>
            <span className="text-xs text-white">Settings</span>
          </button>
        </div>
        
        {/* AR Controls */}
        <div className="flex justify-between items-center">
          <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <span className="material-icons text-white">flashlight_on</span>
          </button>
          
          <button className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <span className="material-icons text-white text-2xl">center_focus_strong</span>
          </button>
          
          <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <span className="material-icons text-white">photo_library</span>
          </button>
        </div>
      </div>
    </div>
  );
}

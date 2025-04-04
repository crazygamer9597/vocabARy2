import { useApp } from '@/contexts/AppContext';

export default function NavBar() {
  const { 
    isLanguageSelectorOpen, 
    setIsLanguageSelectorOpen,
    isLearningProgressOpen,
    setIsLearningProgressOpen, 
    selectedLanguage, 
    score,
    learnedWordsCount
  } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-14">
        <div className="flex items-center">
          <h1 className="text-white font-bold text-lg">
            vocab<span className="text-primary-custom">AR</span>y
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsLanguageSelectorOpen(true)} 
            className="flex items-center px-3 py-1 rounded-full text-sm font-medium"
            style={{ background: 'linear-gradient(90deg, #8F87F1, #C68EFD)', color: 'white' }}
          >
            <span className="material-icons text-white mr-1 text-sm">translate</span>
            {selectedLanguage?.name || 'Language'}
          </button>
          
          <button 
            onClick={() => setIsLearningProgressOpen(true)}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <div className="flex items-center px-3 py-1 bg-gray-800 rounded-full text-sm">
              <span className="material-icons text-[#FED2E2] text-sm mr-1">star</span>
              <span>{score}</span>
            </div>
          </button>
          
          <div className="flex items-center px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300">
            <span className="material-icons text-[#C68EFD] text-sm mr-1">bookmark</span>
            <span>{learnedWordsCount} words</span>
          </div>
        </div>
      </div>
    </header>
  );
}
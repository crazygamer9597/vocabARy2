import { useApp } from '@/contexts/AppContext';
import AppIcon from './AppIcon';
import { Link, useLocation } from 'wouter';

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
  
  const [location] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-14">
        <div className="flex items-center">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-white font-bold text-lg cursor-pointer">
                vocab<span className="text-primary-custom">AR</span>y
              </h1>
            </Link>
            <div className="w-8 h-8 ml-3">
              <AppIcon />
            </div>
          </div>
          
          <nav className="ml-8">
            <ul className="flex space-x-6">
              <li>
                <Link href="/">
                  <span className={`text-sm cursor-pointer ${location === '/' ? 'text-white font-medium' : 'text-gray-400 hover:text-white'}`}>
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/vocabulary-lists">
                  <span className={`text-sm cursor-pointer ${location === '/vocabulary-lists' ? 'text-white font-medium' : 'text-gray-400 hover:text-white'}`}>
                    My Lists
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
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
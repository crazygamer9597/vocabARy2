import { useApp } from '@/contexts/AppContext';

export default function Onboarding() {
  const { setIsOnboardingVisible } = useApp();

  const handleStartAR = () => {
    setIsOnboardingVisible(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  return (
    <div className="fixed inset-0 z-30 bg-black/95 flex flex-col items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-icons text-primary text-3xl">view_in_ar</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to vocabARy</h1>
        <p className="text-gray-400 mb-8">Learn new vocabulary words by scanning objects around you in augmented reality</p>
        
        <div className="space-y-6 mb-8">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
              <span className="material-icons text-white text-xl">search</span>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Scan Real Objects</h3>
              <p className="text-gray-400 text-sm">Point your camera at objects around you and vocabARy will identify them</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
              <span className="material-icons text-white text-xl">translate</span>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Learn Translations</h3>
              <p className="text-gray-400 text-sm">See translations in your selected language appear in AR</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-4 mt-1 flex-shrink-0">
              <span className="material-icons text-white text-xl">emoji_events</span>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium mb-1">Track Your Progress</h3>
              <p className="text-gray-400 text-sm">Earn points for each new word you learn and watch your vocabulary grow</p>
            </div>
          </div>
        </div>
        
        <button 
          className="w-full bg-primary hover:bg-indigo-700 text-white py-4 rounded-xl font-medium text-lg transition-colors"
          onClick={handleStartAR}
        >
          Start Learning in AR
        </button>
        <p className="text-gray-500 text-xs mt-4">Requires camera permissions</p>
      </div>
    </div>
  );
}

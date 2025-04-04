import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import './tutorial-animations.css';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  animation: string; // CSS class for the animation
  icon: string;      // Material icon name
}

export default function ARTutorial() {
  const { setIsOnboardingVisible } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [animationPlaying, setAnimationPlaying] = useState(true);

  // Define the tutorial steps
  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "Point your camera at objects",
      description: "Move your camera around to detect different objects in your surroundings.",
      animation: "camera-pan-animation",
      icon: "camera_alt"
    },
    {
      id: 2,
      title: "Object Recognition",
      description: "The app will identify objects and highlight them with a box.",
      animation: "object-highlight-animation",
      icon: "search"
    },
    {
      id: 3,
      title: "Learn New Words",
      description: "Tap on highlighted objects to see translations and add them to your vocabulary.",
      animation: "word-learn-animation",
      icon: "school"
    },
    {
      id: 4,
      title: "Earn Points",
      description: "Get 10 points for each new word. Review words for 5 more points!",
      animation: "points-animation",
      icon: "star"
    }
  ];

  // Auto-advance the tutorial after a delay
  useEffect(() => {
    if (!showTutorial) return;

    const timer = setTimeout(() => {
      if (currentStep < tutorialSteps.length - 1) {
        setAnimationPlaying(false);
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setAnimationPlaying(true);
        }, 300);
      }
    }, 5000); // 5 seconds per step

    return () => clearTimeout(timer);
  }, [currentStep, showTutorial, tutorialSteps.length]);

  // Close tutorial and mark as viewed
  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('arTutorialViewed', 'true');
    setIsOnboardingVisible(false);
  };
  
  if (!showTutorial) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-gray-900 rounded-2xl w-full max-w-md p-6 mx-4 overflow-hidden border border-gray-800 shadow-xl tutorial-appear">
        {/* Close button */}
        <button 
          onClick={completeTutorial} 
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-800 transition-colors duration-200"
          aria-label="Close tutorial"
        >
          <span className="material-icons text-gray-400 hover:text-white">close</span>
        </button>
        
        {/* Progress indicators */}
        <div className="flex justify-center space-x-2 mb-6">
          {tutorialSteps.map((step, index) => (
            <div 
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentStep ? 'w-8 bg-gradient-to-r from-[#8F87F1] to-[#E9A5F1]' : 
                index < currentStep ? 'w-4 bg-gray-500' : 'w-4 bg-gray-700'
              }`}
            />
          ))}
        </div>
        
        {/* Tutorial content with step transition */}
        <div className="text-center mb-8 step-transition" key={currentStep}>
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg ${
            animationPlaying ? tutorialSteps[currentStep].animation : ''
          }`} style={{ background: 'linear-gradient(135deg, #8F87F1, #E9A5F1)' }}>
            <span className="material-icons text-white text-4xl">{tutorialSteps[currentStep].icon}</span>
          </div>
          
          <h2 className="text-2xl font-bold mb-3 text-white bg-clip-text text-transparent bg-gradient-to-r from-[#C68EFD] to-[#FED2E2]">
            {tutorialSteps[currentStep].title}
          </h2>
          <p className="text-gray-300 text-lg">{tutorialSteps[currentStep].description}</p>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button 
            onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : completeTutorial()}
            className="px-4 py-2 text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            {currentStep > 0 ? 'Back' : 'Skip'}
          </button>
          
          <button 
            onClick={() => currentStep < tutorialSteps.length - 1 ? setCurrentStep(prev => prev + 1) : completeTutorial()}
            className="px-5 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            style={{ background: 'linear-gradient(90deg, #8F87F1, #C68EFD)' }}
          >
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Got it!'}
          </button>
        </div>
        
        {/* Step counter */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-500">
          {currentStep + 1}/{tutorialSteps.length}
        </div>
      </div>
    </div>
  );
}
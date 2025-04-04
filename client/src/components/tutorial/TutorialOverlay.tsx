import { useState, useEffect } from 'react';
import './tutorial-animations.css';

interface TutorialOverlayProps {
  onClose: () => void;
}

export default function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [activeStep, setActiveStep] = useState(0);
  
  // Auto-advance steps with a longer timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeStep < 3) {
        setActiveStep(prev => prev + 1);
      } else {
        onClose();
      }
    }, 4000); // Each step shows for 4 seconds
    
    return () => clearTimeout(timer);
  }, [activeStep, onClose]);
  
  // Step content
  const getStepContent = () => {
    switch(activeStep) {
      case 0: // Point camera at objects
        return (
          <div className="absolute inset-x-0 top-1/4 flex flex-col items-center">
            <div className="camera-pan-animation bg-black/40 p-3 rounded-full mb-4">
              <span className="material-icons text-white text-3xl">camera_alt</span>
            </div>
            <p className="bg-black/70 text-white px-4 py-2 rounded-lg text-center max-w-xs">
              Point your camera at different objects
            </p>
          </div>
        );
        
      case 1: // Object detection
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-32 h-32 object-highlight-animation">
              <div className="absolute inset-0 border-2 border-dashed border-[#C68EFD] rounded-lg"></div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-lg whitespace-nowrap">
                Objects Detected
              </div>
            </div>
          </div>
        );
        
      case 2: // Word cards
        return (
          <div className="absolute right-8 top-1/3">
            <div className="word-learn-animation bg-gray-900/90 p-4 rounded-lg border border-[#8F87F1] shadow-lg mb-2 max-w-[200px]">
              <h3 className="text-[#FED2E2] font-bold mb-1">Cup</h3>
              <p className="text-white text-sm mb-1">கோப்பை</p>
              <div className="flex justify-between items-center text-xs text-gray-300">
                <span>90% confidence</span>
                <button className="bg-[#8F87F1]/80 text-white px-2 py-1 rounded text-xs">Learn</button>
              </div>
            </div>
            <p className="bg-black/70 text-white p-2 rounded text-sm text-center">
              Tap cards to learn words
            </p>
          </div>
        );
        
      case 3: // Points and progress
        return (
          <div className="absolute inset-x-0 top-1/3 flex flex-col items-center">
            <div className="points-animation bg-black/70 p-4 rounded-lg text-center mb-3">
              <span className="material-icons text-yellow-400 text-3xl mb-2">star</span>
              <p className="text-white font-bold">+10 points!</p>
            </div>
            <p className="bg-black/70 text-white px-4 py-2 rounded-lg max-w-xs text-center">
              Learn words to earn points and track your progress
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Progress indicator */}
      <div className="absolute top-4 left-0 right-0 flex justify-center space-x-2 z-50">
        {[0, 1, 2, 3].map(step => (
          <div 
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === activeStep ? 'w-8 bg-[#C68EFD]' : 
              step < activeStep ? 'w-4 bg-white/60' : 'w-4 bg-white/30'
            }`}
          />
        ))}
      </div>
      
      {/* Tutorial content */}
      <div className="absolute inset-0 step-transition" key={activeStep}>
        {getStepContent()}
      </div>
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-black/50 p-2 rounded-full pointer-events-auto"
      >
        <span className="material-icons text-white text-xl">close</span>
      </button>
    </div>
  );
}
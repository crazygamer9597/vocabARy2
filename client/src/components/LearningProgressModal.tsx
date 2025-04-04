import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';

export default function LearningProgressModal() {
  const { 
    setIsLearningProgressOpen, 
    score, 
    level, 
    pointsToNextLevel,
    currentLearnedWord,
    selectedLanguage
  } = useApp();
  
  const [showAnimation, setShowAnimation] = useState(false);
  const progressPercentage = 100 - (pointsToNextLevel);

  useEffect(() => {
    // Start the animation when the component mounts
    setShowAnimation(true);
    
    // Create confetti effect (simplified version)
    const container = document.getElementById('progress-confetti');
    if (container) {
      const colors = ['#8F87F1', '#C68EFD', '#E9A5F1', '#FED2E2'];
      
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.className = 'absolute w-2 h-2 opacity-0 rounded-full';
          confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          confetti.style.left = `${Math.random() * 100}%`;
          confetti.style.top = '100%';
          confetti.style.transform = 'translateY(0)';
          confetti.style.opacity = '0';
          
          // Animate the confetti
          confetti.animate([
            { transform: 'translateY(0)', opacity: 1 },
            { transform: `translateY(-${Math.random() * 120 + 50}px) translateX(${(Math.random() - 0.5) * 100}px)`, opacity: 1 },
            { transform: `translateY(-${Math.random() * 150 + 100}px) translateX(${(Math.random() - 0.5) * 200}px)`, opacity: 0 }
          ], {
            duration: 2000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
          });
          
          container.appendChild(confetti);
          
          // Remove the confetti after animation
          setTimeout(() => {
            confetti.remove();
          }, 3000);
        }, i * 40); // Stagger the confetti creation
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 mx-4 animate-[scaleIn_0.3s_ease-out_forwards] overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-[#8F87F1] via-[#C68EFD] to-[#E9A5F1] animate-pulse"></div>
        
        {/* Container for confetti */}
        <div id="progress-confetti" className="absolute inset-0 overflow-hidden pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-4">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${showAnimation ? 'animate-[pulse_1.5s_ease-in-out_infinite]' : ''}`} style={{ background: 'linear-gradient(135deg, #8F87F1, #E9A5F1)' }}>
              <span className="material-icons text-white text-4xl">emoji_events</span>
            </div>
            
            <div className={`${showAnimation ? 'animate-[slideDown_0.5s_ease-out_forwards]' : ''}`} style={{ opacity: showAnimation ? 1 : 0 }}>
              <h2 className="text-3xl font-bold mb-1" style={{ color: '#8F87F1' }}>Congratulations!</h2>
              <h3 className="text-xl text-gray-800 dark:text-white mb-2">New Word Learned!</h3>
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="text-gray-800 font-semibold">{currentLearnedWord || 'New word'}</span>
                <span className="text-gray-500">•</span>
                <span className="font-semibold" style={{ color: '#C68EFD' }}>{selectedLanguage?.name || 'Language'}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                +10 points added to your vocabulary score!
              </p>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-4 relative overflow-hidden">
            {/* Gradient overlay on progress bar */}
            <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-[#8F87F1] to-[#E9A5F1]"></div>
            
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400 text-sm">Current score</span>
                <div className="flex items-center">
                  <span className="material-icons text-[#FED2E2] mr-1 text-sm">star</span>
                  <span className="font-bold text-gray-900 dark:text-white">{score}</span>
                </div>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-600 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${progressPercentage}%`,
                    background: 'linear-gradient(90deg, #8F87F1, #C68EFD, #E9A5F1)' 
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium" style={{ color: '#8F87F1' }}>Level {level}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {pointsToNextLevel} points to Level {level + 1}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 rounded-xl font-medium transition-colors"
              onClick={() => setIsLearningProgressOpen(false)}
            >
              Continue Learning
            </button>
            <button 
              className="flex-1 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
              style={{ background: 'linear-gradient(90deg, #8F87F1, #C68EFD)' }}
            >
              <span className="material-icons mr-1 text-sm">share</span>
              Share Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

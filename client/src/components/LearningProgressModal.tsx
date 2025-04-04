import { useApp } from '@/contexts/AppContext';

export default function LearningProgressModal() {
  const { 
    setIsLearningProgressOpen, 
    score, 
    level, 
    pointsToNextLevel,
    currentLearnedWord
  } = useApp();

  const progressPercentage = 100 - (pointsToNextLevel);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 mx-4 animate-[scaleIn_0.3s_ease-out_forwards]">
        <div className="text-center mb-4">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-success text-3xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">New Word Learned!</h2>
          <p className="text-gray-600 dark:text-gray-300">
            You've added "{currentLearnedWord || 'New word'}" to your vocabulary
          </p>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm">Current score</span>
            <div className="flex items-center">
              <span className="material-icons text-yellow-400 mr-1 text-sm">star</span>
              <span className="font-bold text-gray-900 dark:text-white">{score}</span>
            </div>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Level {level}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {pointsToNextLevel} points to Level {level + 1}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button 
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 rounded-xl font-medium transition-colors"
            onClick={() => setIsLearningProgressOpen(false)}
          >
            Continue
          </button>
          <button className="flex-1 bg-primary hover:bg-indigo-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center">
            <span className="material-icons mr-1 text-sm">share</span>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

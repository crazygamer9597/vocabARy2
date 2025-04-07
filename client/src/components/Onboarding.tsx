
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

        <div className="flex flex-col gap-4 items-center justify-center mt-6">
          <button
            className="bg-primary hover:bg-indigo-700 text-white py-4 rounded-xl font-medium text-lg transition-colors"
            onClick={() => {
              // Make sure camera initialization happens
              console.log("Starting learning - initializing object detection");
              
              // Hide onboarding immediately
              setIsOnboardingVisible(false);
              
              // Dispatch the event with a slight delay to ensure state updates
              setTimeout(() => {
                console.log("Dispatching startObjectDetection event");
                
                // Try to ensure video is ready
                const videoElement = document.querySelector('video');
                if (videoElement) {
                  videoElement.muted = true;
                  videoElement.playsInline = true;
                  videoElement.setAttribute('playsinline', '');
                  
                  if (videoElement.paused) {
                    console.log("Attempting to play video from onboarding click");
                    videoElement.play()
                      .then(() => console.log("Video playback started successfully"))
                      .catch(err => console.log('Could not play video:', err));
                  }
                }
                
                // Create and dispatch a custom event to trigger object detection
                // Request camera access before starting AR
                navigator.mediaDevices.getUserMedia({ 
                  video: true,
                  audio: false 
                }).then(() => {
                  // Now dispatch the startObjectDetection event
                  const event = new CustomEvent('startObjectDetection');
                  window.dispatchEvent(event);
                  
                  // Dispatch a second time after a delay to ensure it's caught
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('startObjectDetection'));
                  }, 500);
                }).catch(error => {
                  // Show alert if camera access is denied
                  alert("Camera access is required. Please allow camera access and try again.");
                  console.error("Camera permission denied:", error);
                });
              }, 200);
            }}
          >
            Start Learning in AR
          </button>
        </div>
        <p className="text-gray-500 text-xs mt-4">Requires camera permissions</p>

        {/* Add debug information */}
        <div className="mt-4 text-xs text-left text-gray-500">
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <div className="mt-2 p-2 bg-gray-800 rounded text-gray-300">
              <p>If camera doesn't start, try:</p>
              <ul className="list-disc pl-4 mt-1">
                <li>Checking camera permissions in browser settings</li>
                <li>Using a different browser (Chrome recommended)</li>
                <li>Reloading the page</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

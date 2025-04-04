import { useEffect, useRef, useState } from 'react';
import { useWebXR } from '@/hooks/use-webxr';
import { useObjectDetection } from '@/hooks/use-object-detection';
import ObjectMarker from './detection/ObjectMarker';
import WordCard from './detection/WordCard';
import Confetti from './confetti/Confetti';
import CameraControls from './CameraControls';
import NavBar from './NavBar';
import Footer from './Footer';
import ARTutorial from './tutorial/ARTutorial';
import TutorialOverlay from './tutorial/TutorialOverlay';
import { useApp } from '@/contexts/AppContext';

export default function ARView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [markedAsLearned, setMarkedAsLearned] = useState<Set<string>>(new Set());
  const [showTutorial, setShowTutorial] = useState(false);
  const [showTutorialOverlay, setShowTutorialOverlay] = useState(false);
  
  const { 
    detectedObjects, 
    setDetectedObjects, 
    selectedCameraId,
    isCameraAccessDenied
  } = useApp();
  
  const { initAR, arSupported, arActive } = useWebXR(canvasRef);
  const { startObjectDetection, stopObjectDetection } = useObjectDetection(
    videoRef,
    (objects) => {
      // Filter out any objects that we've already detected
      const newDetections = objects.filter(obj => 
        !detectedObjects.some(existing => 
          existing.name === obj.name && 
          Math.abs(existing.boundingBox.x - obj.boundingBox.x) < 50 && 
          Math.abs(existing.boundingBox.y - obj.boundingBox.y) < 50
        )
      );
      
      if (newDetections.length > 0) {
        setDetectedObjects([...detectedObjects, ...newDetections]);
      }
    }
  );
  
  // Check if tutorial has been viewed before
  useEffect(() => {
    const tutorialViewed = localStorage.getItem('arTutorialViewed');
    if (!tutorialViewed) {
      // Only show tutorial if it hasn't been viewed before
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        if (containerRef.current) {
          setContainerSize({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight - 120, // Account for header and footer
          });
        }
      };
      
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);
  
  // Make sure object detection starts regardless of AR mode
  useEffect(() => {
    // We'll start object detection when:
    // 1. AR is active (for AR mode)
    // 2. OR WebXR is not supported but camera is available (for camera fallback mode)
    if (arActive || (!arSupported && videoRef.current && videoRef.current.readyState >= 2 && !isCameraAccessDenied)) {
      console.log('Starting object detection');
      startObjectDetection();
    }
    
    return () => {
      stopObjectDetection();
    };
  }, [arActive, arSupported, startObjectDetection, stopObjectDetection, isCameraAccessDenied]);
  
  // Initialize camera on load and when the selected camera changes
  useEffect(() => {
    // Initialize camera if not in AR mode and not denied access
    if (videoRef.current && !arActive && !isCameraAccessDenied) {
      console.log('Initializing camera feed');
      
      // Stop any existing video stream
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Start a new video stream with the selected camera
      navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
          facingMode: !selectedCameraId ? 'environment' : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      .then(stream => {
        console.log('Camera access granted, starting video stream');
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Start object detection once video starts
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            startObjectDetection();
          };
        }
      })
      .catch(error => {
        console.error('Error accessing camera:', error);
        alert('Error accessing camera. Please ensure camera permissions are granted.');
      });
    }
  }, [selectedCameraId, arActive, isCameraAccessDenied, startObjectDetection]);
  
  // Trigger confetti animation
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };
  
  const handleMarkAsLearned = (objectName: string) => {
    if (!markedAsLearned.has(objectName)) {
      triggerConfetti();
      setMarkedAsLearned(prev => new Set(prev).add(objectName));
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-black">
      <NavBar />
      
      {/* AR Tutorial Overlay */}
      {showTutorial && <ARTutorial />}
      
      <div 
        id="ar-view" 
        ref={containerRef} 
        className="relative flex-1 overflow-hidden bg-black"
        style={{ marginTop: '56px', marginBottom: '32px' }}
      >
        {!arSupported && (
          <div className="absolute top-0 left-0 bg-black bg-opacity-70 p-2 rounded-br-lg text-white z-10 text-xs max-w-[200px]">
            <div className="flex items-center">
              <span className="material-icons text-yellow-500 mr-1 text-sm">warning</span>
              <span>WebXR not supported. Using camera mode.</span>
            </div>
          </div>
        )}
        
        {/* Show message when camera access is denied */}
        {isCameraAccessDenied && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 z-50">
            <div className="text-center p-6 max-w-md bg-gray-900 rounded-lg shadow-xl border border-red-500">
              <span className="material-icons text-red-500 text-4xl mb-4">videocam_off</span>
              <div className="text-white text-xl mb-2">Camera Access Denied</div>
              <p className="text-gray-300 text-sm mb-4">
                Please allow camera access in your browser settings to use this application.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-custom rounded-md text-white"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Either WebXR canvas or fallback video will be displayed */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
        <video 
          ref={videoRef} 
          className={`absolute inset-0 w-full h-full object-cover ${arActive ? 'hidden' : ''}`}
          playsInline
          autoPlay={true}
          muted={true}
          style={{ transform: 'scaleX(-1)' }} /* Mirror video for selfie mode */
        ></video>
        
        {/* Object markers and word cards */}
        {detectedObjects.map((object, index) => (
          <ObjectMarker 
            key={`${object.name}-${index}`}
            position={{ x: object.boundingBox.x, y: object.boundingBox.y }}
            containerSize={containerSize}
          >
            <WordCard 
              object={object}
              onMarkAsLearned={() => handleMarkAsLearned(object.name)}
              isLearned={markedAsLearned.has(object.name)}
            />
          </ObjectMarker>
        ))}
        
        {/* Confetti effect */}
        {showConfetti && <Confetti />}
        
        {/* Camera controls */}
        <CameraControls />
        
        {/* In-camera Tutorial Overlay */}
        {showTutorialOverlay && (
          <TutorialOverlay onClose={() => setShowTutorialOverlay(false)} />
        )}
        
        {/* Help button with dropdown menu */}
        <div className="absolute top-20 right-4 z-20">
          <div className="relative group">
            <button
              className="bg-gray-800 bg-opacity-70 p-2 rounded-full text-white hover:bg-opacity-100 transition-all duration-200"
              aria-label="Tutorial options"
            >
              <span className="material-icons">help_outline</span>
            </button>
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-900 bg-opacity-95 ring-1 ring-black ring-opacity-5 invisible group-hover:visible transition-all duration-200 origin-top-right">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 hover:text-white flex items-center"
                  role="menuitem"
                >
                  <span className="material-icons mr-2 text-sm">menu_book</span>
                  Full Tutorial
                </button>
                <button
                  onClick={() => setShowTutorialOverlay(true)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 hover:text-white flex items-center"
                  role="menuitem"
                >
                  <span className="material-icons mr-2 text-sm">live_help</span>
                  Show Camera Guide
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Start AR button if not active */}
        {arSupported && !arActive && (
          <button 
            onClick={initAR}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white py-3 px-6 rounded-xl font-medium transition-colors"
            style={{ background: 'linear-gradient(90deg, #8F87F1, #C68EFD)' }}
          >
            Start AR Experience
          </button>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

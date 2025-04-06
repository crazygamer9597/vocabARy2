import { useEffect, useRef, useState } from 'react';
import { useWebXR } from '@/hooks/use-webxr';
import { useObjectDetection } from '@/hooks/use-object-detection';
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton';
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

  const { arActive, arSupported, initAR, scene, camera, renderer, addObject, createTextLabel } = useWebXR(canvasRef, {
    onARSceneReady: (scene) => {
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 10, 5);
      scene.add(directionalLight);
    }
  });
  const { startObjectDetection, stopObjectDetection, isModelLoaded } = useObjectDetection(
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

  // Start AR mode if supported after delay, otherwise fallback to camera mode
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let initAttempts = 0;
    const maxAttempts = 3;
    let isInitializing = false;

    const initializeCamera = async () => {
      if (isInitializing) return;
      isInitializing = true;
      if (!videoRef.current || isCameraAccessDenied) return;

      try {
        // Only initialize if we need to change cameras or don't have a stream
        if (currentStream?.active) {
          const currentTrack = currentStream.getVideoTracks()[0];
          if (currentTrack?.readyState === 'live' && 
              currentTrack.getSettings().deviceId === selectedCameraId) {
            return;
          }
        }

        // Stop any ongoing play attempts
        if (videoRef.current.srcObject) {
          const oldStream = videoRef.current.srcObject as MediaStream;
          oldStream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
          // Wait for the old stream to fully stop
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        const isMobile = window.innerWidth < 768;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: !isMobile && selectedCameraId ? { exact: selectedCameraId } : undefined,
            facingMode: isMobile ? 'environment' : (!selectedCameraId ? 'environment' : undefined),
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (!videoRef.current) return;
        
        // Set up video element before attaching stream
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;
        
        // Attach stream and wait for loadedmetadata
        videoRef.current.srcObject = stream;
        currentStream = stream;
        
        await new Promise((resolve) => {
          if (!videoRef.current) return;
          videoRef.current.onloadedmetadata = resolve;
        });
        
        // Now try to play
        try {
          await videoRef.current.play();
          console.log('Camera initialized successfully - waiting for model before starting detection');
          await startObjectDetection();
          initAttempts = 0;
        } catch (playError) {
          console.error('Error playing video:', playError);
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          // Don't throw, just log the error
          console.warn('Play request failed, will retry:', playError);
        }

      } catch (error) {
        console.error('Error accessing camera:', error);
        initAttempts++;

        if (initAttempts < maxAttempts) {
          setTimeout(initializeCamera, 1000);
        }
      }
    };

    initializeCamera();

    return () => {
      stopObjectDetection();
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedCameraId, arSupported, arActive, isCameraAccessDenied, initAR, startObjectDetection, stopObjectDetection]);

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
        {/* Loading spinner overlay */}
        {!isModelLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-custom border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white text-sm">Initializing AI Model...</p>
            </div>
          </div>
        )}
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
        <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${!arActive ? 'hidden' : ''}`}></canvas>
        <video 
          ref={videoRef} 
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          autoPlay={true}
          muted={true}
          style={{ 
            display: arActive ? 'none' : 'block'
          }}
        ></video>

        {/* AR Word cards */}
        {arActive && detectedObjects.slice(-3).map((object, index) => {
          // Calculate AR position based on detection
          const position = new THREE.Vector3(
            object.boundingBox.x - 0.5,
            object.boundingBox.y - 0.5,
            -1 // 1 meter in front
          );

          // Create text mesh for word card
          const wordCardMesh = createWordCardMesh(
            object,
            position,
            markedAsLearned.has(object.name),
            () => handleMarkAsLearned(object.name)
          );

          if (wordCardMesh && scene) {
            scene.add(wordCardMesh);
          }

          // Add confetti effect in AR if word is learned
          if (showConfetti && scene) {
            createARConfetti(scene, position);
          }

          return null;
        })}

        {/* Camera mode word cards */}
        {!arActive && detectedObjects.slice(-3).map((object, index) => (
          <div key={`${object.name}-${index}`}>
            <div 
              className="absolute border-2 border-primary-custom"
              style={{
                left: `${object.boundingBox.x * containerSize.width}px`,
                top: `${object.boundingBox.y * containerSize.height}px`,
                width: `${object.boundingBox.width * containerSize.width}px`,
                height: `${object.boundingBox.height * containerSize.height}px`
              }}
            />
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
          </div>
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

        {/* AR initialization is now handled through the onboarding flow */}
      </div>

      <Footer />
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import { useWebXR } from '@/hooks/use-webxr';
import { useObjectDetection } from '@/hooks/use-object-detection';
import ObjectMarker from './detection/ObjectMarker';
import WordCard from './detection/WordCard';
import Confetti from './confetti/Confetti';
import { useApp } from '@/contexts/AppContext';

export default function ARView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [markedAsLearned, setMarkedAsLearned] = useState<Set<string>>(new Set());
  
  const { detectedObjects, setDetectedObjects } = useApp();
  
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
  
  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        if (containerRef.current) {
          setContainerSize({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          });
        }
      };
      
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);
  
  useEffect(() => {
    if (arActive) {
      startObjectDetection();
    }
    
    return () => {
      stopObjectDetection();
    };
  }, [arActive, startObjectDetection, stopObjectDetection]);
  
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
    <div id="ar-view" ref={containerRef} className="relative w-full h-screen bg-black">
      {!arSupported && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="text-center p-6 max-w-md">
            <div className="text-secondary text-xl mb-2">WebXR Not Supported</div>
            <p className="text-gray-400 text-sm">
              Your browser doesn't support WebXR. Please try on a compatible device or browser.
            </p>
          </div>
        </div>
      )}
      
      {/* Either WebXR canvas or fallback video will be displayed */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
      <video 
        ref={videoRef} 
        className={`absolute inset-0 w-full h-full object-cover ${arActive ? 'hidden' : ''}`}
        playsInline
        autoPlay
        muted
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
      
      {/* Start AR button if not active */}
      {arSupported && !arActive && (
        <button 
          onClick={initAR}
          className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-primary hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
        >
          Start AR Experience
        </button>
      )}
    </div>
  );
}

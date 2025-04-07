import { useEffect, useRef, useState, RefObject } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { getTranslation, getPronunciation } from '@/lib/translations';
import { useApp } from '@/contexts/AppContext';

type ObjectDetectionBaseModel = 'mobilenet_v1' | 'mobilenet_v2' | 'lite_mobilenet_v2';

interface DetectedObject {
  name: string;
  translation: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  categories: string[];
  pronunciation?: string;
}

type DetectionCallback = (objects: DetectedObject[]) => void;

const useObjectDetection = (
  videoRef: RefObject<HTMLVideoElement>,
  onDetection: DetectionCallback
) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const modelRef = useRef<cocossd.ObjectDetection | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const frameCounterRef = useRef<number>(0);
  const { selectedLanguage } = useApp();

  // Load the model with offline support
  useEffect(() => {
    let isMounted = true;

    async function loadModel() {
      if (!isMounted) return;

      try {
        // Ensure TensorFlow is ready
        console.log('Initializing TensorFlow.js...');
        await tf.ready();
        console.log('TensorFlow.js initialized');

        if (!modelRef.current) {
          console.log('Loading COCO-SSD object detection model...');

          // Check if we're online or offline
          const isOnline = navigator.onLine;
          console.log(`Network status: ${isOnline ? 'online' : 'offline'}`);

          // Set model loading options - MobileNetV2 is smaller and works better offline
          const modelConfig = {
            base: 'mobilenet_v2' as ObjectDetectionBaseModel,
          };

          // Use try-catch specifically for model loading
          try {
            // If offline, load from IndexedDB if available
            // TensorFlow automatically caches models, so this works for offline use
            const model = await cocossd.load(modelConfig);

            if (!isMounted) return;

            modelRef.current = model;
            setIsModelLoaded(true);
            console.log('COCO-SSD model loaded and initialized successfully');
            console.log('Model configuration:', modelConfig);
          } catch (modelError) {
            console.error('Error loading COCO-SSD model:', modelError);

            // Try loading with a fallback model if main one fails
            if (isMounted) {
              console.log('Attempting to load with fallback model...');
              const fallbackModel = await cocossd.load({
                base: 'lite_mobilenet_v2' as ObjectDetectionBaseModel,
              });

              if (!isMounted) return;

              modelRef.current = fallbackModel;
              setIsModelLoaded(true);
              console.log('Fallback model loaded successfully');
            }
          }
        }
      } catch (error) {
        console.error('Error initializing TensorFlow:', error);
      }
    }

    loadModel();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Helper function to map object categories
  const getObjectCategories = (name: string): string[] => {
    const categoryMap: Record<string, string[]> = {
      'person': ['Human', 'Common'],
      'bicycle': ['Vehicle', 'Common'],
      'car': ['Vehicle', 'Common'],
      'motorcycle': ['Vehicle', 'Common'],
      'airplane': ['Vehicle', 'Transport'],
      'bus': ['Vehicle', 'Transport'],
      'train': ['Vehicle', 'Transport'],
      'truck': ['Vehicle', 'Transport'],
      'boat': ['Vehicle', 'Transport'],
      'traffic light': ['Street', 'Common'],
      'fire hydrant': ['Street', 'Common'],
      'stop sign': ['Street', 'Sign'],
      'parking meter': ['Street', 'Common'],
      'bench': ['Furniture', 'Common'],
      'bird': ['Animal', 'Wildlife'],
      'cat': ['Animal', 'Pet'],
      'dog': ['Animal', 'Pet'],
      'horse': ['Animal', 'Wildlife'],
      'sheep': ['Animal', 'Wildlife'],
      'cow': ['Animal', 'Wildlife'],
      'elephant': ['Animal', 'Wildlife'],
      'bear': ['Animal', 'Wildlife'],
      'zebra': ['Animal', 'Wildlife'],
      'giraffe': ['Animal', 'Wildlife'],
      'backpack': ['Accessory', 'Common'],
      'umbrella': ['Accessory', 'Common'],
      'handbag': ['Accessory', 'Fashion'],
      'tie': ['Clothing', 'Fashion'],
      'suitcase': ['Accessory', 'Travel'],
      'frisbee': ['Sports', 'Recreation'],
      'skis': ['Sports', 'Winter'],
      'snowboard': ['Sports', 'Winter'],
      'sports ball': ['Sports', 'Recreation'],
      'kite': ['Sports', 'Recreation'],
      'baseball bat': ['Sports', 'Recreation'],
      'baseball glove': ['Sports', 'Recreation'],
      'skateboard': ['Sports', 'Recreation'],
      'surfboard': ['Sports', 'Water'],
      'tennis racket': ['Sports', 'Recreation'],
      'bottle': ['Container', 'Common'],
      'wine glass': ['Kitchenware', 'Dining'],
      'cup': ['Kitchenware', 'Dining'],
      'fork': ['Kitchenware', 'Dining'],
      'knife': ['Kitchenware', 'Dining'],
      'spoon': ['Kitchenware', 'Dining'],
      'bowl': ['Kitchenware', 'Dining'],
      'banana': ['Food', 'Fruit'],
      'apple': ['Food', 'Fruit'],
      'sandwich': ['Food', 'Meal'],
      'orange': ['Food', 'Fruit'],
      'broccoli': ['Food', 'Vegetable'],
      'carrot': ['Food', 'Vegetable'],
      'hot dog': ['Food', 'Meal'],
      'pizza': ['Food', 'Meal'],
      'donut': ['Food', 'Dessert'],
      'cake': ['Food', 'Dessert'],
      'chair': ['Furniture', 'Common'],
      'couch': ['Furniture', 'Common'],
      'potted plant': ['Plant', 'Decor'],
      'bed': ['Furniture', 'Common'],
      'dining table': ['Furniture', 'Common'],
      'toilet': ['Bathroom', 'Fixture'],
      'tv': ['Electronics', 'Entertainment'],
      'laptop': ['Electronics', 'Computing'],
      'mouse': ['Electronics', 'Computing'],
      'remote': ['Electronics', 'Control'],
      'keyboard': ['Electronics', 'Computing'],
      'cell phone': ['Electronics', 'Communication'],
      'microwave': ['Appliance', 'Kitchen'],
      'oven': ['Appliance', 'Kitchen'],
      'toaster': ['Appliance', 'Kitchen'],
      'sink': ['Fixture', 'Kitchen'],
      'refrigerator': ['Appliance', 'Kitchen'],
      'book': ['Stationery', 'Reading'],
      'clock': ['Decor', 'Timepiece'],
      'vase': ['Decor', 'Container'],
      'scissors': ['Tool', 'Cutting'],
      'teddy bear': ['Toy', 'Stuffed'],
      'hair drier': ['Appliance', 'Bathroom'],
      'toothbrush': ['Bathroom', 'Hygiene'],
    };

    return categoryMap[name.toLowerCase()] || ['Unknown', 'Other'];
  };

  // Using pronunciation helper from translations module

  // Helper function to load model - made accessible outside useEffect
  const loadModel = async (): Promise<boolean> => {
    try {
      console.log('Attempting to load COCO-SSD model...');
      // Ensure TensorFlow is ready
      await tf.ready();

      // Set model loading options - MobileNetV2 is smaller and works better offline
      const modelConfig = {
        base: 'mobilenet_v2' as ObjectDetectionBaseModel,
      };

      // If offline, load from IndexedDB if available
      // TensorFlow automatically caches models, so this works for offline use
      const model = await cocossd.load(modelConfig);

      modelRef.current = model;
      setIsModelLoaded(true);
      console.log('COCO-SSD model loaded and initialized successfully');
      console.log('Model configuration:', modelConfig);
      return true;
    } catch (error) {
      console.error('Error loading model in loadModel function:', error);
      return false;
    }
  };

  // Start detection
  const startObjectDetection = async () => {
    console.log('Starting object detection...');

    if (!videoRef.current) {
      console.error('Video element not available');
      return;
    }

    if (isRunning) {
      console.log('Detection already running');
      return;
    }

    console.log('Waiting for video to be ready...');

    // Explicitly request camera permissions first
    try {
      console.log('Requesting camera permissions explicitly...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      // If we got a stream, stop it immediately - we just needed to check permissions
      stream.getTracks().forEach(track => track.stop());
      console.log('Camera permissions granted');
    } catch (error) {
      console.error('Camera permission denied:', error);
      // Don't return here, we'll try one more time with the regular flow
    }

    // Wait for video to be ready with timeout
    try {
      await Promise.race([
        new Promise<void>((resolve) => {
          if (videoRef.current?.readyState >= 2) {
            resolve();
          } else {
            const handleLoaded = () => {
              videoRef.current?.removeEventListener('loadeddata', handleLoaded);
              resolve();
            };
            videoRef.current?.addEventListener('loadeddata', handleLoaded, { once: true });
          }
        }),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Video ready timeout')), 8000)
        )
      ]);
    } catch (error) {
      console.warn('Timed out waiting for video to be ready, continuing anyway');
    }

    console.log('Video ready state:', videoRef.current?.readyState);

    // Wait for model to load with timeout
    const modelLoadTimeout = 10000; // 10 seconds timeout

    console.log('Checking model status:', { isModelLoaded, hasModel: !!modelRef.current });

    if (!isModelLoaded || !modelRef.current) {
      console.log('Model not loaded yet, waiting...');
      try {
        await Promise.race([
          new Promise<void>((resolve) => {
            const checkModel = () => {
              if (isModelLoaded && modelRef.current) {
                resolve();
              } else {
                setTimeout(checkModel, 500);
              }
            };
            checkModel();
          }),
          new Promise<void>((resolve) => 
            setTimeout(() => {
              console.warn('Model load timeout - attempting to load manually');
              resolve();
            }, modelLoadTimeout)
          )
        ]);
      } catch (error) {
        console.warn('Error waiting for model:', error);
      }
    }

    if (!modelRef.current) {
      console.log('Model not loaded - attempting to load now');
      const loaded = await loadModel();
      if (!loaded) {
        console.error('Failed to load model, cannot start detection');
        return;
      }
    }

    // Make sure we're not already running before setting flag
    if (isRunning) return;

    console.log('Model ready - Starting object detection loop');
    setIsRunning(true);

    // Keep track of consecutive detection failures to avoid excessive retries
    let failureCount = 0;
    const MAX_FAILURES = 5;

    const detectObjects = async () => {
      if (!isRunning) {
        console.log('Detection stopped');
        return;
      }

      if (!videoRef.current || !modelRef.current) {
        console.log('Detection resources unavailable, retrying...');
        failureCount++;
        if (isRunning && failureCount < MAX_FAILURES) {
          // If we're still supposed to be running, retry after a short delay
          setTimeout(() => {
            if (isRunning) {
              animationFrameRef.current = requestAnimationFrame(detectObjects);
            }
          }, 1000);
        } else if (failureCount >= MAX_FAILURES) {
          console.error('Too many detection failures, stopping detection');
          stopObjectDetection();
        }
        return;
      }

      // Reset failure count when resources are available
      failureCount = 0;

      // Check if video is actually ready for detection
      if (videoRef.current.readyState < 2) { // HAVE_CURRENT_DATA = 2
        console.log('Video not ready yet, retrying...');
        if (isRunning) {
          // Use requestAnimationFrame directly to reduce flickering
          animationFrameRef.current = requestAnimationFrame(detectObjects);
        }
        return;
      }

      try {
        // Skip detection if video isn't properly initialized yet
        if (!videoRef.current || !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
          animationFrameRef.current = requestAnimationFrame(detectObjects);
          return;
        }

        // Don't try to restart video playback during detection loop - this causes flickering
        // Just check if video is playing and if not, schedule next frame
        if (videoRef.current.paused) {
          console.log('Video is paused during detection loop');
          animationFrameRef.current = requestAnimationFrame(detectObjects);
          return;
        }

        // Log detection attempt every 30 frames to reduce console spam
        frameCounterRef.current++;
        if (frameCounterRef.current % 30 === 0) {
          console.log('Running detection on frame', frameCounterRef.current);
        }

        // Check if video dimensions are valid
        if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
          console.log('Video dimensions not available yet, skipping detection');
          if (isRunning) {
            animationFrameRef.current = requestAnimationFrame(detectObjects);
          }
          return;
        }

        const predictions = await modelRef.current.detect(videoRef.current, {
          score: 0.3,  // Lower threshold for more detections
          maxNumBoxes: 5  // Detect up to 5 objects
        });

        // Only log when we find something to reduce console noise
        if (predictions.length > 0) {
          console.log('Detection results:', {
            found: predictions.length,
            frames: frameCounterRef.current,
            timestamp: new Date().toISOString()
          });
        }

        // Filter predictions with a confidence score > 0.35
        const highConfidencePredictions = predictions.filter(
          prediction => prediction.score > 0.35  // Lower threshold for more frequent detections
        );

        if (highConfidencePredictions.length > 0) {
          console.log('Objects detected:', highConfidencePredictions.map(p => ({ name: p.class, confidence: p.score })));
          const detectedObjects: DetectedObject[] = await Promise.all(
            highConfidencePredictions.map(async (prediction) => {
              const { class: name, score, bbox } = prediction;
              const [x, y, width, height] = bbox;

              // Make sure we have valid dimensions to avoid divide-by-zero errors
              const videoWidth = videoRef.current?.videoWidth || 1;
              const videoHeight = videoRef.current?.videoHeight || 1;

              // Calculate normalized positions (0-1) for the object
              const normalizedX = x / videoWidth;
              const normalizedY = y / videoHeight;
              const normalizedWidth = width / videoWidth;
              const normalizedHeight = height / videoHeight;

              // Get translation for the detected object
              const translation = await getTranslation(
                name,
                selectedLanguage?.code || 'ta' // Default to Tamil if no language selected
              );

              // Get pronunciation hint if available
              const pronunciation = getPronunciation(
                name,
                selectedLanguage?.code || 'ta'
              );

              return {
                name: name.charAt(0).toUpperCase() + name.slice(1),
                translation,
                confidence: score,
                boundingBox: {
                  x: normalizedX,
                  y: normalizedY,
                  width: normalizedWidth,
                  height: normalizedHeight,
                },
                categories: getObjectCategories(name),
                ...(pronunciation && { pronunciation }),
              };
            })
          );

          onDetection(detectedObjects);
        }
      } catch (error) {
        console.error('Error detecting objects:', error);
        // Don't stop on error, just continue the loop
      }

      // Continue detection loop
      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(detectObjects);
      }
    };

    // Start the detection loop
    console.log('Starting detection loop NOW');
    detectObjects();
  };

  // Stop detection
  const stopObjectDetection = () => {
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  return {
    isModelLoaded,
    isRunning,
    startObjectDetection,
    stopObjectDetection,
  };
};

export { useObjectDetection };
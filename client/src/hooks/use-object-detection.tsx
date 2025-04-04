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

export function useObjectDetection(
  videoRef: RefObject<HTMLVideoElement>,
  onDetection: DetectionCallback
) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const modelRef = useRef<cocossd.ObjectDetection | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { selectedLanguage } = useApp();
  
  // Load the model with offline support
  useEffect(() => {
    async function loadModel() {
      try {
        // Ensure TensorFlow is ready
        await tf.ready();
        
        if (!modelRef.current) {
          console.log('Loading COCO-SSD object detection model...');
          
          // Check if we're online or offline
          const isOnline = navigator.onLine;
          console.log(`Network status: ${isOnline ? 'online' : 'offline'}`);
          
          // Set model loading options - MobileNetV2 is smaller and works better offline
          const modelConfig = {
            base: 'mobilenet_v2' as const,
          };
          
          // If offline, load from IndexedDB if available
          // TensorFlow automatically caches models, so this works for offline use
          const model = await cocossd.load(modelConfig);
          
          modelRef.current = model;
          setIsModelLoaded(true);
          console.log('COCO-SSD model loaded successfully');
        }
      } catch (error) {
        console.error('Error loading object detection model:', error);
      }
    }
    
    loadModel();
    
    return () => {
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
  
  // Start detection
  const startObjectDetection = async () => {
    if (!videoRef.current) {
      console.error('Video element not available for object detection');
      return;
    }
    
    if (!isModelLoaded || !modelRef.current) {
      console.log('Waiting for model to load before starting detection');
      setTimeout(startObjectDetection, 1000); // Retry in 1 second
      return;
    }
    
    console.log('Starting object detection');
    setIsRunning(true);
    
    const detectObjects = async () => {
      if (!videoRef.current || !modelRef.current || !isRunning) {
        console.log('Detection stopped or resources unavailable');
        return;
      }
      
      try {
        const predictions = await modelRef.current.detect(videoRef.current);
        
        // Filter predictions with a confidence score > 0.6
        const highConfidencePredictions = predictions.filter(
          prediction => prediction.score > 0.6
        );
        
        if (highConfidencePredictions.length > 0) {
          const detectedObjects: DetectedObject[] = await Promise.all(
            highConfidencePredictions.map(async (prediction) => {
              const { class: name, score, bbox } = prediction;
              const [x, y, width, height] = bbox;
              
              // Calculate normalized positions (0-1) for the object
              const normalizedX = x / videoRef.current!.videoWidth;
              const normalizedY = y / videoRef.current!.videoHeight;
              const normalizedWidth = width / videoRef.current!.videoWidth;
              const normalizedHeight = height / videoRef.current!.videoHeight;
              
              // Get translation for the detected object
              const translation = await getTranslation(
                name, 
                selectedLanguage?.code || 'es'
              );
              
              // Get pronunciation hint if available
              const pronunciation = getPronunciation(
                name,
                selectedLanguage?.code || 'es'
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
      }
      
      // Continue detection loop
      if (isRunning) {
        animationFrameRef.current = requestAnimationFrame(detectObjects);
      }
    };
    
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
}

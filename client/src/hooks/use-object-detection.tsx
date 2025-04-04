import { useEffect, useRef, useState, RefObject } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { getTranslation } from '@/lib/translations';
import { useApp } from '@/contexts/AppContext';

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
  
  // Load the model
  useEffect(() => {
    async function loadModel() {
      try {
        await tf.ready();
        
        if (!modelRef.current) {
          const model = await cocossd.load({
            base: 'mobilenet_v2',
          });
          modelRef.current = model;
          setIsModelLoaded(true);
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
  
  // Helper function to get pronunciation hints
  const getPronunciation = (word: string, languageCode: string): string | undefined => {
    const pronunciationMap: Record<string, Record<string, string>> = {
      'es': { // Spanish
        'chair': 'see-ya',
        'book': 'lee-bro',
        'cup': 'tah-sah',
        'table': 'meh-sah',
        'computer': 'com-poo-tah-dor',
        'phone': 'teh-leh-fo-no',
        'dog': 'peh-ro',
        'cat': 'gah-to',
      },
      'fr': { // French
        'chair': 'shehz',
        'book': 'leev-ruh',
        'cup': 'tahss',
        'table': 'tah-bluh',
        'computer': 'or-di-na-teur',
        'phone': 'teh-leh-fon',
        'dog': 'shee-an',
        'cat': 'shah',
      },
      'de': { // German
        'chair': 'shtool',
        'book': 'booh-kh',
        'cup': 'tah-seh',
        'table': 'tish',
        'computer': 'reh-kh-ner',
        'phone': 'hahn-dee',
        'dog': 'hoont',
        'cat': 'kah-tseh',
      },
      'ja': { // Japanese
        'chair': 'ee-soo',
        'book': 'hon',
        'cup': 'kah-poo',
        'table': 'tay-boo-ru',
        'computer': 'kon-pyoo-tah',
        'phone': 'den-wa',
        'dog': 'ee-noo',
        'cat': 'neh-ko',
      },
    };
    
    return pronunciationMap[languageCode]?.[word.toLowerCase()];
  };
  
  // Start detection
  const startObjectDetection = async () => {
    if (!isModelLoaded || !videoRef.current || !modelRef.current) return;
    
    setIsRunning(true);
    
    const detectObjects = async () => {
      if (!videoRef.current || !modelRef.current || !isRunning) return;
      
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

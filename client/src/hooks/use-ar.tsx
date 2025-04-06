import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';

interface UseAROptions {
  onARSceneReady?: (scene: THREE.Scene) => void;
}

export function useAR({ onARSceneReady }: UseAROptions = {}) {
  const [isReady, setIsReady] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  
  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Create renderer with XR support
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    rendererRef.current = renderer;

    // Add AR button
    document.body.appendChild(ARButton.createButton(renderer));
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);
    
    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Notify that the AR scene is ready
    setIsReady(true);
    if (onARSceneReady && sceneRef.current) {
      onARSceneReady(sceneRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement.parentElement) {
        rendererRef.current.domElement.parentElement.removeChild(
          rendererRef.current.domElement
        );
      }
    };
  }, [onARSceneReady]);
  
  // Add 3D objects to the scene
  const addObject = (object: THREE.Object3D, position: THREE.Vector3) => {
    if (sceneRef.current) {
      object.position.copy(position);
      sceneRef.current.add(object);
    }
  };
  
  // Create a text label in 3D space
  const createTextLabel = (
    text: string, 
    position: THREE.Vector3, 
    color = 0xffffff
  ) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;
    
    canvas.width = 256;
    canvas.height = 128;
    
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = '24px Arial';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture,
      transparent: true,
      opacity: 0.8,
    });
    
    const geometry = new THREE.PlaneGeometry(1, 0.5);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    
    if (sceneRef.current) {
      sceneRef.current.add(mesh);
    }
    
    return mesh;
  };
  
  // Get the DOM element to attach to the page
  const getRendererDomElement = () => {
    return rendererRef.current?.domElement;
  };
  
  return {
    isReady,
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    addObject,
    createTextLabel,
    getRendererDomElement,
  };
}

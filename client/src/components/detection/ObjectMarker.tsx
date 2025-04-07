
import { ReactNode } from 'react';

interface ObjectMarkerProps {
  position: { 
    x: number; 
    y: number;
    width?: number;
    height?: number;
  };
  containerSize: { width: number; height: number };
  children: ReactNode;
}

export default function ObjectMarker({ 
  position, 
  containerSize,
  children 
}: ObjectMarkerProps) {
  // Calculate position and size in pixels
  const posX = position.x * containerSize.width;
  const posY = position.y * containerSize.height;
  const width = (position.width || 0.2) * containerSize.width;
  const height = (position.height || 0.2) * containerSize.height;
  
  return (
    <div 
      className="ar-object-marker"
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
        pointerEvents: 'auto'
      }}
    >
      {/* Bounding box */}
      <div 
        className="absolute border-2 border-primary-custom animate-pulse"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(143, 135, 241, 0.5)'
        }}
      >
        {/* Corner indicators */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-secondary-custom"></div>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary-custom"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-secondary-custom"></div>
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-secondary-custom"></div>
      </div>
      
      {/* Corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-secondary"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-secondary"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-secondary"></div>
      
      {/* Word card */}
      {children}
    </div>
  );
}

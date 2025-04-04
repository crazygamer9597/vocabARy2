import { ReactNode } from 'react';

interface ObjectMarkerProps {
  position: { x: number; y: number };
  containerSize: { width: number; height: number };
  children: ReactNode;
}

export default function ObjectMarker({ 
  position, 
  containerSize,
  children 
}: ObjectMarkerProps) {
  // Calculate position in pixels based on container size and normalized position
  const posX = position.x * containerSize.width;
  const posY = position.y * containerSize.height;
  
  return (
    <div 
      className="ar-object-marker"
      style={{
        left: `${posX}px`,
        top: `${posY}px`,
      }}
    >
      {/* Object detection marker */}
      <div className="w-24 h-24 rounded-full border-2 border-primary opacity-70 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-secondary animate-pulse"></div>
      </div>
      
      {/* Word card */}
      {children}
    </div>
  );
}

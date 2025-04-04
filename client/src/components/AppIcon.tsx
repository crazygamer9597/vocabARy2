import React from 'react';

const AppIcon = () => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 200" 
      width="48" 
      height="48"
    >
      {/* Base circle with gradient */}
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8F87F1" />
          <stop offset="50%" stopColor="#C68EFD" />
          <stop offset="100%" stopColor="#E9A5F1" />
        </linearGradient>
      </defs>
      
      <circle cx="100" cy="100" r="90" fill="url(#grad1)" />
      
      {/* AR letters stylized */}
      <text 
        x="100" 
        y="120" 
        fontSize="80" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="white"
        fontFamily="sans-serif"
      >
        AR
      </text>
      
      {/* Word bubble to represent language/vocabulary */}
      <path 
        d="M150,60 C170,60 180,75 180,90 C180,105 170,120 150,120 L140,120 L145,135 L130,120 L120,120 C100,120 90,105 90,90 C90,75 100,60 120,60 Z" 
        fill="#FED2E2" 
        opacity="0.9" 
      />
      
      {/* Small circles representing words or vocabulary items */}
      <circle cx="120" cy="90" r="5" fill="white" />
      <circle cx="135" cy="90" r="5" fill="white" />
      <circle cx="150" cy="90" r="5" fill="white" />
    </svg>
  );
};

export default AppIcon;
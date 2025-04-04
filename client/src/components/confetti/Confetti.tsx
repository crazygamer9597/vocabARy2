import { useEffect, useRef } from 'react';

export default function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const colors = ['#8F87F1', '#C68EFD', '#E9A5F1', '#FED2E2'];
    const confettiCount = 75;
    
    // Create confetti elements
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `${Math.random() * 100}%`;
      confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
      container.appendChild(confetti);
      
      // Remove confetti element after animation completes
      setTimeout(() => {
        confetti.remove();
      }, 3000);
    }
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none z-10"
    ></div>
  );
}

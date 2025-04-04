import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Google Material Icons
const link = document.createElement('link');
link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
link.rel = "stylesheet";
document.head.appendChild(link);

// Add Inter font
const fontLink = document.createElement('link');
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// Add title
const title = document.createElement('title');
title.textContent = "vocabARy - Learn vocabulary in AR";
document.head.appendChild(title);

// Initialize speech synthesis for pronunciations
const initializeSpeechSynthesis = () => {
  if ('speechSynthesis' in window) {
    // Load voices - this ensures they are available when needed
    window.speechSynthesis.getVoices();
    
    // Chrome and newer browsers need this event to get all voices
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
      console.log('Speech synthesis voices loaded:', window.speechSynthesis.getVoices().length);
    };
    
    // Ensure we cancel any ongoing speech when the page is unloaded
    window.addEventListener('beforeunload', () => {
      window.speechSynthesis.cancel();
    });
    
    console.log('Speech synthesis initialized');
  } else {
    console.warn('Speech synthesis not supported in this browser');
  }
};

// Initialize speech synthesis
initializeSpeechSynthesis();

createRoot(document.getElementById("root")!).render(<App />);

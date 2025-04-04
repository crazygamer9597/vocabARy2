/**
 * This file handles text-to-speech generation and audio playback
 * for vocabulary word pronunciation.
 */

// Cache for storing generated audio
interface AudioCache {
  [key: string]: HTMLAudioElement;
}

const audioCache: AudioCache = {};

/**
 * Gets or creates an audio element for a specific word and language
 */
export const getWordAudio = (word: string, langCode: string): HTMLAudioElement => {
  const cacheKey = `${langCode}:${word}`;
  
  // Return from cache if available
  if (audioCache[cacheKey]) {
    return audioCache[cacheKey];
  }

  // Create a new audio element using the browser's speech synthesis
  const utterance = new SpeechSynthesisUtterance(word);
  
  // Set the language based on the language code
  utterance.lang = mapLanguageCodeToSpeechLanguage(langCode);
  
  // For performance and offline capability, we're using browser speech synthesis
  // In a production app, we might use a more sophisticated TTS API
  
  // Create an audio element (this won't contain the speech synthesis audio,
  // but we'll use this object to track the state and as the return value)
  const audio = new Audio();
  audioCache[cacheKey] = audio;
  
  return audio;
};

/**
 * Plays the pronunciation for a word in the specified language
 */
export const playWordPronunciation = (word: string, langCode: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = mapLanguageCodeToSpeechLanguage(langCode);
      
      utterance.onend = () => {
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        reject(new Error('Failed to play pronunciation'));
      };
      
      // Play the audio
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to play pronunciation:', error);
      reject(error);
    }
  });
};

/**
 * Maps our language codes to the appropriate BCP 47 language tags
 * used by the Speech Synthesis API
 */
function mapLanguageCodeToSpeechLanguage(langCode: string): string {
  // Map of our language codes to BCP 47 language tags
  const languageMap: { [key: string]: string } = {
    'ta': 'ta-IN', // Tamil (India)
    'hi': 'hi-IN', // Hindi (India)
    'te': 'te-IN', // Telugu (India)
    'ml': 'ml-IN', // Malayalam (India)
    'es': 'es-ES', // Spanish (Spain)
    'fr': 'fr-FR', // French (France)
    'de': 'de-DE', // German (Germany)
    'ja': 'ja-JP', // Japanese (Japan)
    // Add more mappings as needed
  };
  
  return languageMap[langCode] || langCode;
}

/**
 * Check if pronunciation is available for a given language
 */
export const isPronunciationAvailable = (langCode: string): boolean => {
  // Check if the browser supports speech synthesis
  if (!window.speechSynthesis) {
    return false;
  }
  
  // Get available voices
  const voices = window.speechSynthesis.getVoices();
  const mappedLang = mapLanguageCodeToSpeechLanguage(langCode);
  
  // Check if there's a voice for the language
  return voices.some(voice => voice.lang.startsWith(mappedLang.split('-')[0]));
};
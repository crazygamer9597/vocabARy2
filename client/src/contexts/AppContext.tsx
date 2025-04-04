import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface Language {
  id: number;
  name: string;
  code: string;
  wordCount: number;
}

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

interface AppContextType {
  isOnboardingVisible: boolean;
  setIsOnboardingVisible: (value: boolean) => void;
  isLanguageSelectorOpen: boolean;
  setIsLanguageSelectorOpen: (value: boolean) => void;
  isLearningProgressOpen: boolean;
  setIsLearningProgressOpen: (value: boolean) => void;
  score: number;
  setScore: (value: number) => void;
  level: number;
  setLevel: (value: number) => void;
  selectedLanguage: Language | null;
  setSelectedLanguage: (language: Language | null) => void;
  languages: Language[];
  setLanguages: (languages: Language[]) => void;
  detectedObjects: DetectedObject[];
  setDetectedObjects: (objects: DetectedObject[]) => void;
  currentLearnedWord: string | null;
  setCurrentLearnedWord: (word: string | null) => void;
  addLearnedWord: (word: string, translation: string, languageId: number) => Promise<void>;
  pointsToNextLevel: number;
  userId: number;
  learnedWordsCount: number;
  setLearnedWordsCount: (count: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(true);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [isLearningProgressOpen, setIsLearningProgressOpen] = useState(false);
  const [score, setScore] = useState(120);
  const [level, setLevel] = useState(4);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [currentLearnedWord, setCurrentLearnedWord] = useState<string | null>(null);
  const [learnedWordsCount, setLearnedWordsCount] = useState(3);
  
  // For demo purposes, hardcoded user ID
  const userId = 1;
  
  // Calculate points to next level
  const pointsToNextLevel = 100 - (score % 100);

  useEffect(() => {
    // Check if the user has already gone through onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding) {
      setIsOnboardingVisible(false);
    }
    
    // Fetch languages
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages');
        const data = await response.json();
        setLanguages(data.languages);
        
        // Set Spanish as default language if available
        const spanish = data.languages.find((lang: Language) => lang.name === 'Spanish');
        if (spanish) {
          setSelectedLanguage(spanish);
        } else if (data.languages.length > 0) {
          setSelectedLanguage(data.languages[0]);
        }
      } catch (error) {
        console.error('Failed to fetch languages', error);
      }
    };
    
    fetchLanguages();
  }, []);

  // Add a learned word and update score
  const addLearnedWord = async (word: string, translation: string, languageId: number) => {
    try {
      const response = await apiRequest('POST', `/api/users/${userId}/words`, {
        word,
        translation,
        languageId
      });
      
      const data = await response.json();
      setScore(data.score);
      setLevel(data.level);
      setCurrentLearnedWord(translation);
      setLearnedWordsCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add learned word', error);
    }
  };
  
  return (
    <AppContext.Provider
      value={{
        isOnboardingVisible,
        setIsOnboardingVisible,
        isLanguageSelectorOpen,
        setIsLanguageSelectorOpen,
        isLearningProgressOpen,
        setIsLearningProgressOpen,
        score,
        setScore,
        level,
        setLevel,
        selectedLanguage,
        setSelectedLanguage,
        languages,
        setLanguages,
        detectedObjects,
        setDetectedObjects,
        currentLearnedWord,
        setCurrentLearnedWord,
        addLearnedWord,
        pointsToNextLevel,
        userId,
        learnedWordsCount,
        setLearnedWordsCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

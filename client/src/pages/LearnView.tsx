import { useEffect } from 'react';
import ARView from '@/components/ARView';
import LanguageSelector from '@/components/LanguageSelector';
import LearningProgressModal from '@/components/LearningProgressModal';
import Onboarding from '@/components/Onboarding';
import { useApp } from '@/contexts/AppContext';

export default function LearnView() {
  const { 
    isOnboardingVisible, 
    isLanguageSelectorOpen, 
    isLearningProgressOpen,
    setIsOnboardingVisible
  } = useApp();

  // Process URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('skipOnboarding') === 'true') {
      setIsOnboardingVisible(false);
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  }, [setIsOnboardingVisible]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <ARView />
      
      {isLanguageSelectorOpen && <LanguageSelector />}
      {isLearningProgressOpen && <LearningProgressModal />}
      {isOnboardingVisible && <Onboarding />}
    </div>
  );
}
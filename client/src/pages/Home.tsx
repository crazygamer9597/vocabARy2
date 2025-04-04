import { useEffect } from 'react';
import ARView from '@/components/ARView';
import Header from '@/components/Header';
import ControlPanel from '@/components/ControlPanel';
import LanguageSelector from '@/components/LanguageSelector';
import LearningProgressModal from '@/components/LearningProgressModal';
import Onboarding from '@/components/Onboarding';
import { useApp } from '@/contexts/AppContext';

export default function Home() {
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
      <Header />
      <ControlPanel />
      
      {isLanguageSelectorOpen && <LanguageSelector />}
      {isLearningProgressOpen && <LearningProgressModal />}
      {isOnboardingVisible && <Onboarding />}
    </div>
  );
}

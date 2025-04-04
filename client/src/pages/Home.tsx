import { useEffect } from 'react';
import LandingPage from '@/components/LandingPage';
import { useApp } from '@/contexts/AppContext';

export default function Home() {
  const { setIsOnboardingVisible } = useApp();

  // Process URL parameters and initialize app
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('skipOnboarding') === 'true') {
      setIsOnboardingVisible(false);
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  }, [setIsOnboardingVisible]);

  return <LandingPage />;
}

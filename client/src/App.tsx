import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import VocabularyLists from "@/pages/VocabularyLists";
import { AppProvider } from "./contexts/AppContext";
import { configureModelStorage, preloadModels } from "./lib/modelLoader";

// Configure TensorFlow models for offline use
configureModelStorage().catch(err => console.error("Failed to configure model storage", err));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/vocabulary-lists" component={VocabularyLists} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Preload models on app start
  useEffect(() => {
    // Initialize TensorFlow and preload models
    preloadModels().catch(err => console.error("Failed to preload models", err));
    
    // Add event listener for offline/online status
    const handleNetworkChange = () => {
      if (navigator.onLine) {
        console.log("App is online");
      } else {
        console.log("App is offline - using cached data and models");
      }
    };
    
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    // Initial check
    handleNetworkChange();
    
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;

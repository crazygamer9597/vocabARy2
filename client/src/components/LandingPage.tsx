import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import Footer from './Footer';
import NavBar from './NavBar';

export default function LandingPage() {
  const [, setLocation] = useLocation();
  
  const { 
    selectedLanguage,
    level,
    learnedWordsCount,
    setIsLanguageSelectorOpen,
    setIsLearningProgressOpen
  } = useApp();
  
  const features = [
    {
      title: "Identify Objects in Real-Time",
      description: "Point your camera at objects around you and instantly see what they are in both English and your chosen language.",
      icon: "camera_alt",
      color: "#8F87F1"
    },
    {
      title: "Learn in Multiple Languages",
      description: "Choose from several languages including Tamil, Hindi, Telugu, Malayalam and more.",
      icon: "translate",
      color: "#C68EFD"
    },
    {
      title: "Works Completely Offline",
      description: "No internet connection needed after initial setup. Perfect for learning anywhere.",
      icon: "wifi_off",
      color: "#E9A5F1"
    },
    {
      title: "Track Your Learning Progress",
      description: "Keep track of words you've learned and watch your vocabulary grow day by day.",
      icon: "bar_chart",
      color: "#FED2E2"
    },
    {
      title: "Celebrate Your Achievements",
      description: "Earn points and see fun confetti animations when you learn new words.",
      icon: "celebration",
      color: "#8F87F1"
    },
    {
      title: "Augmented Reality Experience",
      description: "Enjoy an immersive learning experience with AR features on supported devices.",
      icon: "view_in_ar",
      color: "#C68EFD"
    },
    {
      title: "Custom Vocabulary Lists",
      description: "Create your own vocabulary lists to organize and review words by topics or categories.",
      icon: "format_list_bulleted",
      color: "#E9A5F1"
    },
    {
      title: "Interactive Learning Cards",
      description: "Detailed word cards with pronunciation guides and example contexts for better retention.",
      icon: "style",
      color: "#FED2E2"
    },
    {
      title: "Multi-Device Support",
      description: "Use the app on mobile, tablet, or desktop devices with seamless experience across all.",
      icon: "devices",
      color: "#8F87F1"
    },
    {
      title: "Social Sharing",
      description: "Share your learning progress and achievements with friends and family.",
      icon: "share",
      color: "#C68EFD"
    },
    {
      title: "Personalized Learning Path",
      description: "Smart algorithm that adapts to your learning pace and focuses on words you need to practice.",
      icon: "tune",
      color: "#E9A5F1"
    },
    {
      title: "Educational Games",
      description: "Fun mini-games that reinforce vocabulary learning through different challenges.",
      icon: "sports_esports",
      color: "#FED2E2"
    }
  ];
  
  const startLearning = () => {
    setLocation('/learn');
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <NavBar />
      
      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center px-4 pt-16 pb-8 md:pt-24 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 to-transparent"></div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center mb-4">
          vocaB<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AR</span>y
        </h1>
        
        <p className="text-xl text-gray-300 text-center max-w-2xl mb-8">
          Learn vocabulary in a natural way by pointing your camera at objects around you
        </p>
        
        {/* Stats Panel */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 w-40">
            <p className="text-gray-400 text-sm">Current Language</p>
            <p className="text-2xl font-bold text-white">{selectedLanguage?.name || 'Tamil'}</p>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 w-40">
            <p className="text-gray-400 text-sm">Your Level</p>
            <p className="text-2xl font-bold text-white">{level}</p>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 w-40">
            <p className="text-gray-400 text-sm">Words Learned</p>
            <p className="text-2xl font-bold text-white">{learnedWordsCount}</p>
          </div>
        </div>
        
        {/* Main Button */}
        <button 
          onClick={startLearning}
          className="px-8 py-4 rounded-full text-white text-lg font-medium shadow-lg transition-all duration-300 transform hover:scale-105"
          style={{ background: 'linear-gradient(90deg, #8F87F1, #C68EFD, #E9A5F1, #FED2E2)' }}
        >
          <span className="flex items-center">
            <span className="material-icons mr-2">play_arrow</span>
            Start Learning Now
          </span>
        </button>
        
        {/* Secondary Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button 
            onClick={() => setIsLanguageSelectorOpen(true)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center"
          >
            <span className="material-icons mr-2">language</span>
            Change Language
          </button>
          
          <button 
            onClick={() => setIsLearningProgressOpen(true)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center"
          >
            <span className="material-icons mr-2">insights</span>
            View Progress
          </button>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="relative container mx-auto px-4 py-16 mt-20">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-400/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-0 w-72 h-72 bg-gradient-to-r from-blue-500/10 to-purple-400/10 rounded-full blur-3xl -z-10"></div>
        
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8F87F1] to-[#FED2E2] text-center mb-4">Amazing Features</h2>
        <p className="text-center text-gray-400 max-w-2xl mx-auto mb-12">Discover all the powerful tools and capabilities that vocabARy brings to make your language learning journey exciting and effective.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              style={{ borderColor: `${feature.color}40` }}
            >
              <div 
                className="w-12 h-12 flex items-center justify-center mb-4 rounded-full transition-transform duration-300 group-hover:scale-110" 
                style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}CC)` }}
              >
                <span className="material-icons text-white">{feature.icon}</span>
              </div>
              <h3 
                className="text-xl font-semibold mb-2 transition-colors duration-300 group-hover:text-white"
                style={{ color: feature.color }}
              >
                {feature.title}
              </h3>
              <p className="text-gray-400 transition-colors duration-300 group-hover:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
        
        {/* Feature highlight box */}
        <div className="mt-16 mx-auto max-w-5xl bg-gradient-to-r from-gray-900/80 to-gray-800/80 p-8 rounded-2xl backdrop-blur-sm border border-white/10">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-1/3 flex justify-center">
              <div 
                className="w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-r from-[#8F87F1] to-[#E9A5F1]"
              >
                <span className="material-icons text-white text-5xl">psychology</span>
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h3 className="text-2xl font-bold text-white mb-3">A Smarter Way to Learn Languages</h3>
              <p className="text-gray-300 mb-4">Our unique approach combines visual learning with interactive technology to help you build your vocabulary faster and more effectively than traditional methods.</p>
              <ul className="space-y-2">
                {[
                  "Learn from your surroundings with real-time object recognition",
                  "Focus on practical, everyday vocabulary you'll actually use",
                  "Personalized learning path adapts to your pace and preferences",
                  "Gamified experience keeps you motivated and engaged"
                ].map((point, i) => (
                  <li key={i} className="flex items-start">
                    <span className="material-icons text-[#C68EFD] mr-2 mt-0.5">check_circle</span>
                    <span className="text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="relative py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#8F87F1]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FED2E2]/10 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#C68EFD] to-[#E9A5F1] text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto mb-16">Our simple three-step process makes learning new vocabulary intuitive and natural.</p>
          
          <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-6 lg:gap-12 max-w-5xl mx-auto">
            {[
              {
                step: 1,
                title: "Point Camera",
                description: "Aim your device at objects around you that you want to learn.",
                icon: "camera_alt", 
                color: "#8F87F1",
                gradient: "from-[#8F87F1] to-[#C68EFD]"
              },
              {
                step: 2,
                title: "See Translations",
                description: "The app automatically identifies objects and shows translations in your chosen language.",
                icon: "translate",
                color: "#C68EFD",
                gradient: "from-[#C68EFD] to-[#E9A5F1]"
              },
              {
                step: 3,
                title: "Learn & Earn",
                description: "Mark words as learned, earn points, and watch your vocabulary grow with fun animations.",
                icon: "school",
                color: "#E9A5F1",
                gradient: "from-[#E9A5F1] to-[#FED2E2]"
              }
            ].map((step, index) => (
              <div 
                key={index}
                className="group w-full md:w-1/3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative mb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="material-icons text-white text-3xl">{step.icon}</span>
                  </div>
                  <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                    <span className="text-gray-900 font-bold">{step.step}</span>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4" style={{ color: step.color }}>{step.title}</h3>
                <p className="text-gray-300 mb-6">{step.description}</p>
                
                <div className="h-1 w-16 rounded-full" style={{ background: `linear-gradient(to right, ${step.color}, ${step.color}88)` }}></div>
              </div>
            ))}
          </div>
          
          {/* Additional explanation */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 max-w-3xl mx-auto mb-8">
              The vocabARy approach is based on scientific research showing that associating words with visual cues dramatically improves retention and recall.
            </p>
            <button
              onClick={startLearning}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
            >
              <span className="material-icons mr-2">play_circle</span>
              Try it yourself
            </button>
          </div>
        </div>
      </div>
      
      {/* Call To Action */}
      <div className="relative py-24">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-900/95 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-[#8F87F1]/20 to-[#C68EFD]/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-[#E9A5F1]/20 to-[#FED2E2]/20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-gray-900/60 to-gray-800/60 backdrop-blur-md rounded-3xl p-10 border border-white/10 shadow-xl">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8F87F1] to-[#FED2E2] mb-4">
              Ready to expand your vocabulary?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Start learning new words in a fun and interactive way today. It's free, it's engaging, and it works!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={startLearning}
                className="px-8 py-4 rounded-full text-white text-lg font-medium shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-[#8F87F1] to-[#C68EFD] hover:from-[#7A72DC] hover:to-[#B179E8]"
              >
                <span className="flex items-center">
                  <span className="material-icons mr-2">play_arrow</span>
                  Start Learning Now
                </span>
              </button>
              
              <button 
                onClick={() => setIsLanguageSelectorOpen(true)}
                className="px-8 py-4 rounded-full text-white text-lg font-medium shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-[#E9A5F1] to-[#FED2E2] hover:from-[#D490DC] hover:to-[#E9BDCD]"
              >
                <span className="flex items-center">
                  <span className="material-icons mr-2">language</span>
                  Choose Language
                </span>
              </button>
            </div>
            
            {/* Feature tags */}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {["Real-time detection", "Offline capable", "Multiple languages", "AR experience", "Learn naturally", "Track progress"].map((tag, i) => (
                <span key={i} className="px-4 py-2 rounded-full bg-white/10 text-sm text-gray-300 border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
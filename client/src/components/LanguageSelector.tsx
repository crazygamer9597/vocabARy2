import { useApp } from '@/contexts/AppContext';

export default function LanguageSelector() {
  const { 
    languages, 
    selectedLanguage, 
    setSelectedLanguage, 
    setIsLanguageSelectorOpen 
  } = useApp();

  const handleLanguageSelect = (language: typeof languages[0]) => {
    setSelectedLanguage(language);
  };

  const handleApply = () => {
    setIsLanguageSelectorOpen(false);
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/70">
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-md p-5 animate-[slideUp_0.3s_ease-out_forwards]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Languages</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setIsLanguageSelectorOpen(false)}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">Choose a language to learn vocabulary in</p>
        
        {/* Language Options */}
        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
          {languages.map((language) => (
            <div 
              key={language.id}
              className="flex items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => handleLanguageSelect(language)}
            >
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3 overflow-hidden">
                <span className="material-icons text-gray-500 dark:text-gray-300">language</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{language.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{language.wordCount.toLocaleString()} vocabulary words</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 ${
                selectedLanguage?.id === language.id 
                  ? 'border-primary flex items-center justify-center' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {selectedLanguage?.id === language.id && (
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className="mt-4 w-full bg-primary hover:bg-indigo-700 text-white py-3 rounded-xl font-medium"
          onClick={handleApply}
        >
          Apply Selection
        </button>
      </div>
    </div>
  );
}

import { useApp } from '@/contexts/AppContext';
import AppIcon from './AppIcon';

export default function Header() {
  const { score } = useApp();

  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 flex items-center justify-center mr-2">
            <AppIcon />
          </div>
          <h1 className="text-xl font-bold text-white">vocab<span className="text-primary">AR</span>y</h1>
        </div>
        
        {/* Score Display */}
        <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="material-icons text-yellow-400 mr-1">star</span>
          <span className="font-bold text-white">{score}</span>
          <span className="text-gray-300 text-xs ml-1">points</span>
        </div>
      </div>
    </header>
  );
}

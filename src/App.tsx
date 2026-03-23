import { useState } from 'react';
import GardenScene from './components/GardenScene';
import { ITEM_DB } from './data';

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number>(1);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const handleAddWithAI = async () => {
    const query = window.prompt("CAD: What would you like to design?");
    if (!query) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) throw new Error("Server Error");

      const aiData = await response.json();
      const newId = Math.floor(Math.random() * 10000) + 10;
      ITEM_DB[newId] = {
        id: newId,
        name: aiData.name,
        category: aiData.category,
        color: aiData.color,
        notes: aiData.notes
      };
      
      setSelectedItemId(newId);
      setIsPaletteOpen(true);
    } catch (e) { 
      alert("AI Backend error. Check your server logs!"); 
    }
    setIsGenerating(false);
  };

  return (
    // 1. THE FIX: h-[100dvh] prevents mobile browsers from hiding the bottom menu
    // 2. THE FIX: select-none prevents accidental text highlighting when swiping
    <div className="relative w-[100dvw] h-[100dvh] overflow-hidden bg-gray-950 text-white select-none touch-none">
      
      {/* The WebGL CAD Canvas */}
      <div className="absolute inset-0">
        <GardenScene selectedTypeId={selectedItemId} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-4 z-10 pb-8 md:pb-8">
        
        {/* Responsive Header */}
        <header className="pointer-events-auto flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-800/90 p-3 md:p-4 rounded-xl border border-gray-700 shadow-2xl gap-2 backdrop-blur-md">
          <h1 className="font-bold tracking-tighter text-green-400 text-lg">WHATGRID <span className="text-gray-500 font-light">CAD</span></h1>
          
          {/* Dynamic Helper Text (Changes based on screen size) */}
          <div className="text-[9px] md:text-[10px] text-gray-400 bg-black/50 px-2 py-1.5 rounded tracking-wider">
            <span className="hidden sm:inline">RIGHT-CLICK TO PAN • SCROLL TO ZOOM</span>
            <span className="sm:hidden">1-FINGER ROTATE • 2-FINGERS PAN/ZOOM</span>
          </div>
        </header>

        {/* Bottom Controls Area */}
        <div className="flex flex-col gap-3">
          
          {/* Mobile-Friendly Scrolling Palette */}
          {isPaletteOpen && (
            <div className="pointer-events-auto p-3 bg-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-xl flex gap-3 overflow-x-auto shadow-2xl w-full snap-x scrollbar-hide">
              {Object.values(ITEM_DB).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1.5 transition-transform snap-center ${
                    selectedItemId === item.id ? 'scale-110 opacity-100' : 'opacity-50'
                  }`}
                >
                  <div className={`w-12 h-12 md:w-10 md:h-10 rounded-xl md:rounded-md ${item.color} border-2 ${selectedItemId === item.id ? 'border-white' : 'border-transparent shadow-inner'}`} />
                  <span className="text-[10px] w-16 truncate text-center font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Thumb-Friendly Navigation */}
          <footer className="pointer-events-auto flex justify-between items-center bg-gray-900/95 backdrop-blur-md p-3 md:p-4 rounded-2xl border border-gray-700 shadow-xl">
            <button 
              onClick={handleAddWithAI}
              className="bg-green-600 w-14 h-14 rounded-full flex items-center justify-center text-3xl font-light hover:bg-green-500 shadow-[0_0_15px_rgba(74,222,128,0.3)] active:scale-95 transition-all"
            >
              {isGenerating ? '...' : '+'}
            </button>
            <button 
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className={`px-8 py-4 md:py-3 rounded-xl font-bold tracking-wide text-xs transition-colors active:scale-95 ${isPaletteOpen ? 'text-green-400 bg-gray-800 border border-green-900/50' : 'text-gray-300 bg-gray-800/50 border border-gray-700'}`}
            >
              ASSETS
            </button>
          </footer>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react';
import Grid from './components/Grid';
import { mockGeminiPlantSearch } from './ai';
import { ITEM_DB } from './data';

export default function App() {
  const [isGenerating, setIsGenerating] = useState(false);

  // The function that runs when you tap the big '+' button
  const handleAddWithAI = async () => {
    const query = window.prompt("Ask AI to generate a plant (e.g., 'Sweet Potatoes', 'Okra'):");
    if (!query) return;

    setIsGenerating(true);
    try {
      // 1. Send the request to our mock AI
      const newItem = await mockGeminiPlantSearch(query);
      
      // 2. Inject the AI's response directly into our database
      ITEM_DB[newItem.id] = newItem; 
      
      // 3. Notify the user
      alert(`Success! ${newItem.name} added to the database. Tap the grid to place it.`);
    } catch (error) {
      console.error("AI Generation failed", error);
    }
    setIsGenerating(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950 text-white font-sans">
      
      {/* Interactive Garden Canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Grid />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 pb-8">
        
        {/* Top Bar */}
        <header className="pointer-events-auto flex justify-between items-center bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-700">
          <h1 className="font-bold text-xl tracking-wider text-green-400">WHATGRID</h1>
          <button className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium">
            Menu
          </button>
        </header>

        {/* Bottom Navigation */}
        <footer className="pointer-events-auto flex justify-around items-center bg-gray-800/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-gray-700">
          <button className="hover:text-green-400 flex flex-col items-center transition-colors">
            <span className="text-sm font-medium">Design</span>
          </button>
          
          {/* Primary Action Button - Now wired to the AI */}
          <button 
            onClick={handleAddWithAI}
            disabled={isGenerating}
            className={`text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg -mt-10 border-4 border-gray-900 transition-transform ${
              isGenerating ? 'bg-gray-600 animate-pulse' : 'bg-green-600 hover:bg-green-500 hover:scale-105'
            }`}
          >
            <span className="text-3xl leading-none font-light">
              {isGenerating ? '...' : '+'}
            </span>
          </button>
          
          <button className="hover:text-green-400 flex flex-col items-center transition-colors">
            <span className="text-sm font-medium">Plants</span>
          </button>
        </footer>

      </div>
    </div>
  )
}

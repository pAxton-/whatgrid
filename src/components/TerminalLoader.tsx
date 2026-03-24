import { useState, useEffect, useRef } from 'react';
import { PropertyData } from './PropertySetupMap';

interface TerminalLoaderProps {
  propertyData: PropertyData;
  onComplete: () => void;
}

export default function TerminalLoader({ propertyData, onComplete }: TerminalLoaderProps) {
  const [text, setText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const isCancelled = useRef(false);

  useEffect(() => {
    isCancelled.current = false;
    
    // Helper function to create realistic terminal pauses
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    // Helper function to type out text one character at a time
    const typeLine = async (line: string, speed: number = 30) => {
      for (let i = 0; i < line.length; i++) {
        if (isCancelled.current) return;
        setText((prev) => prev + line.charAt(i));
        await sleep(speed);
      }
    };

    const bootSequence = async () => {
      await sleep(500);
      await typeLine("> INITIALIZING HOMESTEAD UPLINK...\n\n", 40);
      await sleep(600);
      
      await typeLine(`> CALCULATING PROPERTY BOUNDARY...\n`, 40);
      await sleep(400);
      await typeLine(`> TOTAL AREA: ${propertyData.sqft.toLocaleString()} SQFT\n\n`, 20);
      await sleep(800);

      // We will estimate the Hardiness Zone based on latitude later, using Zone 8 as a placeholder
      await typeLine(`> PINGING USDA DATABASE FOR LAT: ${propertyData.lat.toFixed(4)}, LNG: ${propertyData.lng.toFixed(4)}...\n`, 30);
      await sleep(500);
      await typeLine(`> GROW REGION IDENTIFIED: USDA HARDINESS ZONE 8\n\n`, 20);
      await sleep(800);

      const currentTime = new Date().toLocaleString();
      await typeLine(`> LOCAL SYSTEM TIME: ${currentTime}\n\n`, 30);
      await sleep(1000);

      await typeLine(`> CONNECTING TO VERTEX AI FOR REGIONAL ANALYSIS...\n`, 40);
      await sleep(1500);

      // Clear the screen!
      setText('');
      await sleep(500);

      // The AI Response (We will wire this to your Python backend later!)
      const aiResponse = `--- REGIONAL AI ANALYSIS ---\n\nCLIMATE PROFILE:\nYou are located in a temperate transition zone characterized by long, hot summers and relatively mild winters. This gives you an extended growing season but requires heat-tolerant crop varieties mid-summer.\n\nRECOMMENDED CROPS:\n- Early Spring: Leafy greens, carrots, and radishes.\n- Peak Summer: Tomatoes, peppers, okra, and sweet potatoes.\n- Fall Harvest: Broccoli, cabbage, and garlic.\n\nGROWING TIPS:\n1. Mulch heavily to retain soil moisture during the July-August heat spikes.\n2. Consider shade cloth for delicate vegetables during peak afternoon sun.\n3. Your zone is excellent for permanent fruit trees like figs, peaches, and certain apple varieties.\n\n> END OF TRANSMISSION.`;

      await typeLine(aiResponse, 15); // Type the AI text slightly faster
      await sleep(1000);
      
      if (!isCancelled.current) {
        setShowButton(true);
      }
    };

    bootSequence();

    return () => {
      isCancelled.current = true; // Cleanup if the component unmounts early
    };
  }, [propertyData]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gray-950 text-green-500 font-mono p-8 z-50 flex flex-col pointer-events-auto">
      <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm sm:text-base leading-relaxed tracking-wider">
        {text}
        <span className="animate-pulse">_</span>
      </div>
      
      {showButton && (
        <div className="mt-8 animate-in fade-in duration-1000 flex justify-center pb-12">
          <button 
            onClick={onComplete}
            className="border-2 border-green-500 text-green-500 px-8 py-4 font-bold tracking-widest uppercase hover:bg-green-500 hover:text-black transition-colors"
          >
            Enter 3D Simulator
          </button>
        </div>
      )}
    </div>
  );
}
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
    
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

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
      
      // The Big Reveal!
      await typeLine(`> TOTAL AREA: ${propertyData.sqft.toLocaleString()} SQFT\n\n`, 20);
      await sleep(800);

      const localTime = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'long',
      }).format(new Date());

      await typeLine(`> LOCAL SYSTEM TIME:\n> ${localTime}\n\n`, 30);
      await sleep(1000);

      await typeLine(`> PINGING SATELLITE FOR LAT: ${propertyData.lat.toFixed(4)}, LNG: ${propertyData.lng.toFixed(4)}...\n`, 30);
      await sleep(500);
      await typeLine(`> CONNECTING TO VERTEX AI FOR REGIONAL ANALYSIS...\n`, 40);
      
      let aiResponseText = "";

      try {
        const response = await fetch('/api/analyze-region', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: propertyData.lat, lng: propertyData.lng })
        });
        
        const aiData = await response.json();
        aiResponseText = aiData.text || "CONNECTION ESTABLISHED: NO DATA RETURNED.";
      } catch (error) {
        aiResponseText = "CRITICAL ERROR: UPLINK FAILED. PROCEEDING WITH OFFLINE CACHE.";
      }

      setText('');
      await sleep(500);

      await typeLine(`--- REGIONAL AI ANALYSIS ---\n\n${aiResponseText}\n\n> SYSTEM READY.`, 15);
      await sleep(1000);
      
      if (!isCancelled.current) {
        setShowButton(true);
      }
    };

    bootSequence();

    return () => {
      isCancelled.current = true;
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
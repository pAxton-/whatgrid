import { useState } from 'react';
import { ITEM_DB } from '../data';

export default function Grid() {
  // The grid now holds IDs (starting with 0 for Empty Dirt) instead of just 0s and 1s
  const [grid, setGrid] = useState<number[][]>(Array(10).fill(Array(10).fill(0)));

  const tapCell = (rowIdx: number, colIdx: number) => {
    const newGrid = grid.map(row => [...row]);
    const currentId = newGrid[rowIdx][colIdx];
    
    // For testing, tapping cycles through the IDs (0, 1, 2, 3) in our database
    const nextId = (currentId + 1) % Object.keys(ITEM_DB).length;
    
    newGrid[rowIdx][colIdx] = nextId;
    setGrid(newGrid);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="grid grid-cols-10 gap-1 p-2 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 pointer-events-auto">
        {grid.map((row, rowIdx) => (
          row.map((itemId, colIdx) => {
            // Look up the item from the database using the ID in the grid
            const item = ITEM_DB[itemId];
            
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                onClick={() => tapCell(rowIdx, colIdx)}
                className={`w-8 h-8 md:w-12 md:h-12 rounded-sm cursor-pointer transition-colors duration-200 ${item.color} hover:opacity-80 shadow-inner`}
                title={`${item.name} ${item.notes ? `(${item.notes})` : ''}`}
              />
            );
          })
        ))}
      </div>
      <div className="mt-8 px-6 py-3 bg-gray-800/80 rounded-xl border border-gray-700 pointer-events-auto">
        <p className="text-gray-400 text-xs font-medium tracking-wide uppercase text-center">
          Tap a plot to cycle through items
        </p>
      </div>
    </div>
  );
}

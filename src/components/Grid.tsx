import { useState } from 'react';
import { ITEM_DB } from '../data';

// We tell the Grid to expect a 'selectedItemId' from the main App
interface GridProps {
  selectedItemId: number;
}

export default function Grid({ selectedItemId }: GridProps) {
  const [grid, setGrid] = useState<number[][]>(Array(10).fill(Array(10).fill(0)));

  const paintCell = (rowIdx: number, colIdx: number) => {
    const newGrid = grid.map(row => [...row]);
    
    // Instead of cycling, we apply the exactly selected item
    newGrid[rowIdx][colIdx] = selectedItemId;
    setGrid(newGrid);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="grid grid-cols-10 gap-1 p-2 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 pointer-events-auto">
        {grid.map((row, rowIdx) => (
          row.map((itemId, colIdx) => {
            const item = ITEM_DB[itemId];
            if (!item) return <div key={`${rowIdx}-${colIdx}`} className="w-8 h-8 md:w-12 md:h-12 bg-gray-900" />;

            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                onClick={() => paintCell(rowIdx, colIdx)}
                className={`w-8 h-8 md:w-12 md:h-12 rounded-sm cursor-pointer transition-colors duration-200 ${item.color} hover:opacity-80 shadow-inner`}
                title={`${item.name} ${item.notes ? `(${item.notes})` : ''}`}
              />
            );
          })
        ))}
      </div>
    </div>
  );
}

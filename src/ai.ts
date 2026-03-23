import { HomesteadItem, ItemCategory } from './data';

// This simulates asking the Gemini API for plant data
export async function mockGeminiPlantSearch(query: string): Promise<HomesteadItem> {
  // Simulate the 1.5 seconds it takes for an AI to respond over the network
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Generate a unique ID for the new item
  const newId = Math.floor(Math.random() * 10000) + 10;

  // Pick a random color for the 2D grid representation
  const colors = ['bg-emerald-500', 'bg-lime-500', 'bg-teal-500', 'bg-yellow-500', 'bg-indigo-400'];
  const randomColor = colors[query.length % colors.length];

  return {
    id: newId,
    name: query.charAt(0).toUpperCase() + query.slice(1),
    category: 'Plant' as ItemCategory,
    color: randomColor,
    // The AI dynamically assessing local climate data
    notes: `AI Generated: Optimized for South Carolina climate (Zone 8).`
  };
}

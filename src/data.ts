export type ItemCategory = 'Plant' | 'Infrastructure' | 'Livestock' | 'Empty';

export interface HomesteadItem {
  id: number;
  name: string;
  category: ItemCategory;
  color: string; // Tailwind background color class for the 2D UI
  notes?: string;
}

// Our Mock Database. The key is the ID, the value is the HomesteadItem.
export const ITEM_DB: Record<number, HomesteadItem> = {
  0: { 
    id: 0, 
    name: 'Empty Dirt', 
    category: 'Empty', 
    color: 'bg-gray-900' 
  },
  1: { 
    id: 1, 
    name: 'Tomato (Cherokee Purple)', 
    category: 'Plant', 
    color: 'bg-red-500', 
    notes: 'Mulch with Ramial Chipped Wood (BRF)' 
  },
  2: { 
    id: 2, 
    name: 'Olla Irrigation Pot', 
    category: 'Infrastructure', 
    color: 'bg-orange-700', 
    notes: 'Terracotta capsule watering zone' 
  },
  3: { 
    id: 3, 
    name: 'Meat Rabbit Hutch', 
    category: 'Livestock', 
    color: 'bg-amber-800', 
    notes: 'Breeding pair allocation' 
  }
};

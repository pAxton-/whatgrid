import { useState, useEffect } from 'react';
import GardenScene from './components/GardenScene';
import Compass from './components/Compass';
import PropertySetupMap from './components/PropertySetupMap';
import { ITEM_DB } from './data';

interface ItemContent {
  id: number;
  name: string;
  quantity: number;
  dateAdded: string;
}

interface PlacedItem {
  id: number;
  typeId: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  customLabel?: string;
  notes?: string;
  contents: ItemContent[];
}

type AppMode = 'BUILD' | 'EDIT' | 'MANAGE';

const DEFAULT_STRUCTURES = [
  { id: 901, name: 'House', category: 'Infrastructure', color: 'bg-white' },
  { id: 902, name: 'Barn', category: 'Infrastructure', color: 'bg-red-800' },
  { id: 903, name: 'Greenhouse', category: 'Infrastructure', color: 'bg-blue-200' },
  { id: 904, name: 'Raised Bed', category: 'Infrastructure', color: 'bg-amber-800' },
  { id: 905, name: 'Garden Plot', category: 'Infrastructure', color: 'bg-amber-900' },
  { id: 906, name: 'Fence', category: 'Infrastructure', color: 'bg-amber-700' },
];

DEFAULT_STRUCTURES.forEach(struct => { ITEM_DB[struct.id] = struct as any; });

export default function App() {
  const [propertyData, setPropertyData] = useState<{sqft: number, lat: number, lng: number} | null>(null);
  
  const [timeOfDay, setTimeOfDay] = useState<number>(12);
  const [month, setMonth] = useState<number>(6);
  const [showEnvControls, setShowEnvControls] = useState(false);

  const [camRotation, setCamRotation] = useState(0);
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [mode, setMode] = useState<AppMode>('BUILD');
  const [selectedItem, setSelectedItem] = useState<PlacedItem | null>(null);
  const [targetCoord, setTargetCoord] = useState<{x: number, z: number} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const savedFarm = localStorage.getItem('whatgrid_farm');
    const savedSetup = localStorage.getItem('whatgrid_setup');
    if (savedFarm) setItems(JSON.parse(savedFarm));
    if (savedSetup) setPropertyData(JSON.parse(savedSetup));
  }, []);

  const saveFarm = () => {
    localStorage.setItem('whatgrid_farm', JSON.stringify(items));
    if (propertyData) localStorage.setItem('whatgrid_setup', JSON.stringify(propertyData));
    alert("Homestead Saved!");
  };

  const propertyDim = propertyData ? Math.sqrt(propertyData.sqft) : 0;

  const handlePlace = (typeId: number) => {
    if (!targetCoord) return;
    const newItem: PlacedItem = {
      id: Date.now(),
      typeId,
      position: [targetCoord.x, 0, targetCoord.z],
      rotation: [0, 0, 0],
      contents: []
    };
    setItems([...items, newItem]);
    setTargetCoord(null);
  };

  const addContentToStructure = async (structureId: number) => {
    const query = window.prompt("Adding (e.g. '4 Tomato Plants')");
    if (!query || !propertyData) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query,
          context: `The user is located at Latitude ${propertyData.lat}, Longitude ${propertyData.lng}. Factor their local climate and USDA Hardiness Zone into your categorization and advice.`
        }),
      });
      const aiData = await response.json();
      const newContent = {
        id: Date.now(),
        name: aiData.name || query,
        quantity: parseInt(query.match(/\d+/)?.[0] || '1', 10),
        dateAdded: new Date().toISOString().split('T')[0]
      };
      setItems(prevItems => {
        const newItems = prevItems.map(item => item.id === structureId ? { ...item, contents: [...item.contents, newContent] } : item);
        const updated = newItems.find(i => i.id === structureId);
        if (updated) setSelectedItem(updated);
        return newItems;
      });
    } catch (e) { alert("AI error"); }
    setIsGenerating(false);
  };

  const removeContent = (structureId: number, contentId: number) => {
    setItems(prevItems => {
      const newItems = prevItems.map(item => item.id === structureId ? { ...item, contents: item.contents.filter(c => c.id !== contentId) } : item);
      const updated = newItems.find(i => i.id === structureId);
      if (updated) setSelectedItem(updated);
      return newItems;
    });
  };

  const updateStructureData = (id: number, customLabel: string, notes: string) => {
    setItems(items.map(i => i.id === id ? { ...i, customLabel, notes } : i));
  };

  // --- THIS IS THE NEW MAP INTEGRATION ---
  if (!propertyData) {
    return <PropertySetupMap onConfirm={setPropertyData} />;
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="fixed inset-0 w-[100dvw] h-[100dvh] overflow-hidden bg-gray-950 text-white select-none touch-none">
      
      <div className="absolute inset-0">
        <GardenScene 
          items={items} mode={mode} propertySize={propertyDim}
          latitude={propertyData.lat} month={month} timeOfDay={timeOfDay}
          selectedItemId={selectedItem?.id || null} onCameraRotate={setCamRotation}
          onGroundClick={(x, z) => { if (mode === 'BUILD') setTargetCoord({x, z}); setSelectedItem(null); }}
          onItemClick={setSelectedItem}
          onUpdateTransform={(id, pos, rot) => { setItems(items.map(i => i.id === id ? { ...i, position: pos, rotation: rot } : i)); }}
        />
      </div>

      <div className="absolute top-[env(safe-area-inset-top,1rem)] left-4 pointer-events-none z-40 mt-2">
        <Compass rotation={camRotation} />
      </div>

      <div className="absolute top-[env(safe-area-inset-top,1rem)] right-4 pointer-events-auto z-40 mt-2 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <button onClick={() => setShowEnvControls(!showEnvControls)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest shadow-xl border transition-colors ${showEnvControls ? 'bg-amber-500 text-black border-amber-400' : 'bg-gray-900/90 border-white/20 hover:bg-gray-800'}`}>SUN</button>
          <button onClick={saveFarm} className="bg-blue-600/90 hover:bg-blue-500 px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest shadow-xl border border-blue-400/20">SAVE</button>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-red-900/40 border border-red-900/50 px-4 py-2.5 rounded-xl text-[10px] font-black tracking-widest text-red-400">RESET</button>
        </div>

        {showEnvControls && (
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl w-64 animate-in slide-in-from-top-2">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-amber-500 uppercase font-black tracking-widest">Time of Day</label>
                <span className="text-xs font-mono">{Math.floor(timeOfDay)}:00</span>
              </div>
              <input type="range" min="0" max="24" step="0.5" value={timeOfDay} onChange={(e) => setTimeOfDay(Number(e.target.value))} className="w-full accent-amber-500" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-amber-500 uppercase font-black tracking-widest">Month</label>
                <span className="text-xs font-mono">{months[month - 1]}</span>
              </div>
              <input type="range" min="1" max="12" step="1" value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-full accent-amber-500" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-10 sm:bottom-8 left-0 right-0 pointer-events-auto z-50 flex justify-center px-4">
        <div className="bg-gray-900/95 p-1.5 rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex gap-1 w-full max-w-sm">
          {(['BUILD', 'EDIT', 'MANAGE'] as AppMode[]).map(m => (
            <button 
              key={m} onClick={() => { setMode(m); setTargetCoord(null); setSelectedItem(null); setShowEnvControls(false); }}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all ${mode === m ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {targetCoord && mode === 'BUILD' && (
        <div className="absolute bottom-32 sm:bottom-28 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-auto z-40">
          <div className="p-4 bg-gray-900/95 backdrop-blur-2xl border border-green-500/30 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4 px-2">
              <span className="text-[10px] font-black text-green-400 tracking-widest uppercase">Structures</span>
              <button onClick={() => setTargetCoord(null)} className="text-gray-500 text-lg p-1">✕</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {DEFAULT_STRUCTURES.map(s => (
                <button key={s.id} onClick={() => handlePlace(s.id)} className="flex-shrink-0 flex flex-col items-center gap-2 group snap-center">
                  <div className={`w-14 h-14 rounded-2xl ${s.color} border-2 border-transparent group-hover:border-white transition-all shadow-inner`} />
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedItem && mode === 'EDIT' && (
        <div className="absolute bottom-32 sm:bottom-28 left-1/2 -translate-x-1/2 pointer-events-auto z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gray-900/95 p-2 rounded-2xl border border-amber-500/30 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl flex gap-2 items-center">
            <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase px-3 hidden sm:block">EDITING</span>
            <button onClick={() => { const offsetPos: [number, number, number] = [selectedItem.position[0] + 5, 0, selectedItem.position[2] + 5]; setItems([...items, { ...selectedItem, id: Date.now(), position: offsetPos }]); }} className="bg-amber-600/20 text-amber-400 border border-amber-500/20 px-5 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-amber-600/40">Duplicate</button>
            <button onClick={() => { setItems(items.filter(i => i.id !== selectedItem.id)); setSelectedItem(null); }} className="bg-red-900/20 text-red-500 border border-red-500/20 px-5 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-red-900/40">Delete</button>
            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>
            <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white px-3 py-2 text-lg">✕</button>
          </div>
        </div>
      )}

      {selectedItem && mode === 'MANAGE' && (
        <div className="absolute inset-x-0 bottom-32 sm:inset-y-0 sm:right-0 sm:left-auto sm:bottom-auto w-full sm:w-96 px-4 sm:p-4 pointer-events-none z-[60]">
          <div className="h-[50vh] sm:h-full pointer-events-auto bg-gray-900/98 backdrop-blur-3xl sm:border-l border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col rounded-[2rem] sm:rounded-l-[2rem] overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-start shrink-0">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight leading-tight">{selectedItem.customLabel || ITEM_DB[selectedItem.typeId].name}</h2>
                <p className="text-[10px] text-green-500 uppercase tracking-[0.3em] font-black mt-1">MANAGER MODE</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="bg-white/5 hover:bg-white/10 text-white w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.currentTarget); updateStructureData(selectedItem.id, formData.get('label') as string, formData.get('notes') as string); alert("Saved!"); }} className="space-y-4">
                <div>
                  <input name="label" defaultValue={selectedItem.customLabel || ''} placeholder="Rename Structure..." className="w-full bg-black/40 p-4 rounded-2xl border border-white/5 text-sm focus:border-green-500 outline-none" />
                </div>
                <div>
                  <textarea name="notes" defaultValue={selectedItem.notes || ''} placeholder="Maintenance notes..." rows={2} className="w-full bg-black/40 p-4 rounded-2xl border border-white/5 text-sm focus:border-green-500 outline-none resize-none" />
                </div>
                <button type="submit" className="w-full bg-white text-black font-black py-3 rounded-2xl text-[10px] tracking-widest uppercase hover:bg-green-500">Apply Changes</button>
              </form>

              <div className="space-y-4">
                <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest block">Inventory</label>
                <div className="space-y-2">
                  {selectedItem.contents.map(c => (
                    <div key={c.id} className="bg-white/5 p-3 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-black text-white">{c.quantity}x {c.name}</div>
                        <div className="text-[9px] text-gray-500 font-bold mt-1 uppercase">{c.dateAdded}</div>
                      </div>
                      <button onClick={() => removeContent(selectedItem.id, c.id)} className="text-red-500/50 hover:text-red-500 p-2">✕</button>
                    </div>
                  ))}
                  <button onClick={() => addContentToStructure(selectedItem.id)} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-[10px] font-black text-gray-500 tracking-widest uppercase hover:text-green-400">
                    {isGenerating ? 'Analyzing...' : '+ Add Item'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
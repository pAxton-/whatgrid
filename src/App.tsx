import { useState } from 'react';
import PropertySetupMap, { PropertyData } from './components/PropertySetupMap';
import GardenScene from './components/GardenScene';

function App() {
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);

  return (
    <div className="w-screen h-screen">
      {!propertyData ? (
        <PropertySetupMap onConfirm={setPropertyData} />
      ) : (
        <GardenScene propertyData={propertyData} />
      )}
    </div>
  );
}

export default App;
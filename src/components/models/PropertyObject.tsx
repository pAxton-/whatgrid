import GardenBed from './GardenBed';
import Greenhouse from './Greenhouse';
import Barn from './Barn';
import Livestock from './Livestock';
import Plant from './Plant';

interface PlacedItem {
  id: number;
  typeId: number;
  position: [number, number, number];
}

export default function PropertyObject({ item, typeInfo }: { item: PlacedItem; typeInfo: any }) {
  if (!typeInfo) return null;

  const colorName = typeInfo.color.split('-')[1] || 'gray';
  const cat = typeInfo.category;
  const name = typeInfo.name.toLowerCase();

  if (name.includes('bed')) {
    return <GardenBed position={item.position} />;
  } else if (name.includes('greenhouse') || name.includes('green house')) {
    return <Greenhouse position={item.position} />;
  } else if (cat === 'Infrastructure') {
    return <Barn position={item.position} color={colorName} isBarn={name.includes('barn')} />;
  } else if (cat === 'Livestock') {
    return <Livestock position={item.position} color={colorName} />;
  } else {
    return <Plant position={item.position} color={colorName} isTree={name.includes('tree')} />;
  }
}

import GardenBed from './GardenBed';
import Greenhouse from './Greenhouse';
import Barn from './Barn';
import House from './House';
import Fence from './Fence';
import Livestock from './Livestock';
import Plant from './Plant';

export default function PropertyObject({ item, typeInfo }: { item: any; typeInfo: any }) {
  if (!typeInfo) return null;

  const colorName = typeInfo.color?.split('-')[1] || 'gray';
  const name = typeInfo.name.toLowerCase();

  if (name.includes('house') && !name.includes('green')) {
    return <House position={item.position} color={colorName} />;
  } else if (name.includes('greenhouse')) {
    return <Greenhouse position={item.position} />;
  } else if (name.includes('bed') || name.includes('plot')) {
    // PASSING CONTENTS HERE
    return <GardenBed position={item.position} contents={item.contents} />;
  } else if (name.includes('fence')) {
    return <Fence position={item.position} />;
  } else if (name.includes('barn')) {
    return <Barn position={item.position} color={colorName} isBarn={true} />;
  } else if (name.includes('livestock') || name.includes('cow') || name.includes('chicken')) {
    return <Livestock position={item.position} color={colorName} />;
  } else {
    return <Plant position={item.position} color={colorName} isTree={name.includes('tree')} />;
  }
}

interface CompassProps {
  rotation: number;
}

export default function Compass({ rotation }: CompassProps) {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center bg-gray-900/80 rounded-full border border-gray-700 shadow-xl backdrop-blur-md">
      <div 
        className="relative w-full h-full transition-transform duration-75 ease-out"
        style={{ transform: `rotate(${-rotation}rad)` }}
      >
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-red-500">N</span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400">S</span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">W</span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">E</span>
        
        {/* Needle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-10 bg-gradient-to-b from-red-500 via-gray-400 to-gray-400 rounded-full" />
      </div>
    </div>
  );
}

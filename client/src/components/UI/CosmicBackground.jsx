import React, { useMemo } from 'react';

export default function CosmicBackground() {
  const starsStyle = useMemo(() => {
    const shadows = [];
    for (let i = 0; i < 100; i++) {
      const x = Math.floor(Math.random() * 2000);
      const y = Math.floor(Math.random() * 2000);
      const alpha = (0.2 + Math.random() * 0.7).toFixed(2);
      shadows.push(`${x}px ${y}px rgba(255, 255, 255, ${alpha})`);
    }
    return { boxShadow: shadows.join(', ') };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-warzone-void" aria-hidden="true">
      <div className="absolute -inset-[15%] filter blur-[25px] animate-nebula bg-[radial-gradient(750px_600px_at_15%_15%,rgba(255,52,52,0.22),transparent_60%),radial-gradient(800px_650px_at_85%_75%,rgba(255,211,77,0.14),transparent_60%),radial-gradient(600px_500px_at_80%_15%,rgba(255,52,52,0.14),transparent_55%),radial-gradient(550px_500px_at_20%_85%,rgba(255,211,77,0.10),transparent_55%)]" />
      <div className="absolute top-0 left-0 w-[2px] h-[2px] rounded-full" style={starsStyle} />
      <div className="absolute inset-0 bg-[radial-gradient(1600px_1000px_at_50%_20%,transparent_40%,rgba(5,5,7,0.8)_100%)]" />
    </div>
  );
}

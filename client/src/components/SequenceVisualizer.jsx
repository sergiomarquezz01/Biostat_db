import React, { useRef, useEffect } from 'react';

const SequenceVisualizer = ({ sequence }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const colors = { A: '#FF5733', T: '#33FF57', C: '#3357FF', G: '#F333FF' };

    // Limpiar y dibujar mini-bloques por cada base nitrogenada
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const blockSize = 5;
    
    sequence.split('').forEach((base, i) => {
      ctx.fillStyle = colors[base] || '#CCCCCC';
      const x = (i * blockSize) % canvas.width;
      const y = Math.floor((i * blockSize) / canvas.width) * blockSize;
      ctx.fillRect(x, y, blockSize - 1, blockSize - 1);
    });
  }, [sequence]);

  return <canvas ref={canvasRef} width={800} height={200} className="border border-slate-700 rounded" />;
};

export default SequenceVisualizer;
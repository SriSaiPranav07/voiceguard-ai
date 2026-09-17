import React, { useEffect, useRef } from 'react';

export const HeroWaveform: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = 140;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      step += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw multi-layered animated frequency waves
      const waves = [
        { color: 'rgba(56, 189, 248, 0.7)', amp: 35, freq: 0.015, speed: 1 },
        { color: 'rgba(59, 130, 246, 0.4)', amp: 25, freq: 0.02, speed: 1.3 },
        { color: 'rgba(16, 185, 129, 0.3)', amp: 20, freq: 0.025, speed: 0.8 },
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = wave.color;

        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * wave.freq + step * wave.speed) * wave.amp * Math.cos(x * 0.005);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Pulse security scanning vertical bar
      const scanX = (Math.sin(step * 0.5) * 0.4 + 0.5) * width;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(scanX, 10);
      ctx.lineTo(scanX, height - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ width: '100%', position: 'relative', overflow: 'hidden', borderRadius: '12px', background: 'rgba(16, 21, 34, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '16px' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '140px' }} />
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.75rem',
        color: 'var(--accent-cyan)',
        fontFamily: 'var(--font-mono)'
      }}>
        <span className="status-dot"></span> REAL-TIME VOICE WAVEFORM ANALYZER
      </div>
    </div>
  );
};

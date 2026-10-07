import React, { useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';

const GLYPHS = 'アイウエオカキクケコサシスセソ0123456789ABCDEF<>[]{}/*#$%&@';

interface Column {
  x: number;
  y: number;
  speed: number;
  length: number;
}

export const MatrixRainWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const isFa = settings.language === 'fa';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !running || !settings.animationsEnabled) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    let width = parent?.clientWidth || 300;
    let height = parent?.clientHeight || 220;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const fontSize = 13;
    const colCount = Math.max(8, Math.floor(width / fontSize));
    const cols: Column[] = Array.from({ length: colCount }, (_, i) => ({
      x: i * fontSize,
      y: Math.random() * -height,
      speed: 1.2 + Math.random() * 2.4,
      length: 8 + Math.floor(Math.random() * 14),
    }));

    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      if (now - last < 33) {
        raf = requestAnimationFrame(draw);
        return;
      }
      last = now;
      ctx.fillStyle = 'rgba(5, 11, 10, 0.16)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px ui-monospace, Consolas, monospace`;

      for (const col of cols) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const headY = col.y;
        ctx.fillStyle = '#b7ffe0';
        ctx.shadowColor = '#4af3a2';
        ctx.shadowBlur = 8;
        ctx.fillText(ch, col.x, headY);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(74, 243, 162, 0.55)';
        for (let i = 1; i < col.length; i++) {
          const g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          ctx.globalAlpha = Math.max(0.05, 1 - i / col.length);
          ctx.fillText(g, col.x, headY - i * fontSize);
        }
        ctx.globalAlpha = 1;

        col.y += col.speed * fontSize * 0.45;
        if (col.y - col.length * fontSize > height) {
          col.y = -Math.random() * height * 0.4;
          col.speed = 1.2 + Math.random() * 2.4;
          col.length = 8 + Math.floor(Math.random() * 14);
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#050b0a';
      ctx.fillRect(0, 0, width, height);
    };

    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [running, settings.animationsEnabled]);

  return (
    <div className="relative flex flex-col h-full min-h-[240px] rounded-2xl overflow-hidden border border-emerald-500/25 bg-black/70 select-none">
      <div className="absolute inset-0 pimx-scanlines opacity-40 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10 flex items-center justify-between px-3 py-2 border-b border-emerald-500/20 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="pimx-hacker-label">MATRIX.RAIN</span>
        </div>
        <button
          type="button"
          onClick={() => setRunning((v) => !v)}
          className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 transition-colors"
        >
          {running ? (isFa ? 'توقف' : 'PAUSE') : (isFa ? 'اجرا' : 'RUN')}
        </button>
      </div>
      <div className="relative flex-1 min-h-0">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 to-transparent pointer-events-none">
          <p className="font-mono text-[10px] text-emerald-300/90" dir="ltr">
            {'>'} follow the white rabbit _
          </p>
        </div>
      </div>
    </div>
  );
};

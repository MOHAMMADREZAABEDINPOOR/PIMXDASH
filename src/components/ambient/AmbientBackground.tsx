import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const AmbientBackground: React.FC = () => {
  const { activeSpace, settings } = useWorkspace();
  const wp = settings.wallpaperType || 'default';

  return (
    <div className="pimx-ambient fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-500 select-none">
      {/* 1. Base Gradient Canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-base/95 to-bg-base" />
      <div className="pimx-ambient-grid" aria-hidden="true" />
      <div className="pimx-ambient-aura" aria-hidden="true" />
      <div className="pimx-matrix-rain" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <span
            key={index}
            className="pimx-matrix-column"
            style={{ left: `${index * 6.7}%`, animationDelay: `${-index * 1.7}s`, animationDuration: `${17 + (index % 5) * 3}s` }}
          >
            {index % 3 === 0 ? '01ア7F\n3B10キ\n01C8ク\n9F20サ\n1101ノ\nA13Dラ\n0101' : index % 3 === 1 ? '7C01ミ\n0F42カ\n101Bオ\nD301タ\n0100ナ\n72A9ヒ\n1101' : '1F08ト\nA010ロ\nC701ハ\n0110ユ\n99F0マ\n1010ソ\n0B71'}
          </span>
        ))}
      </div>
      <div className="pimx-scanlines" aria-hidden="true" />

      {/* 2. Custom Uploaded/URL Wallpaper */}
      {wp === 'custom' && settings.customWallpaperUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${settings.customWallpaperUrl})`,
            opacity: 0.35,
          }}
        />
      )}

      {/* 3. WALLPAPER PRESET: COSMIC NEBULA */}
      {wp === 'cosmic' && (
        <div className="absolute inset-0">
          <div
            className="absolute -top-[10%] left-[10%] w-[60vw] h-[60vh] rounded-full blur-[140px] opacity-40 animate-pulse-subtle"
            style={{
              background: 'radial-gradient(circle, #7928ca 0%, #ff0080 50%, transparent 80%)',
            }}
          />
          <div
            className="absolute -bottom-[20%] right-[10%] w-[60vw] h-[60vh] rounded-full blur-[160px] opacity-30"
            style={{
              background: 'radial-gradient(circle, #0070f3 0%, #00dfd8 60%, transparent 80%)',
            }}
          />
          {/* Subtle star particles */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #ffffff, transparent), radial-gradient(1.5px 1.5px at 150px 200px, #ffffff, transparent), radial-gradient(1px 1px at 400px 350px, #ffffff, transparent), radial-gradient(1.5px 1.5px at 700px 100px, #ffffff, transparent), radial-gradient(1px 1px at 900px 600px, #ffffff, transparent)',
              backgroundSize: '1000px 1000px',
            }}
          />
        </div>
      )}

      {/* 4. WALLPAPER PRESET: TOKYO RAIN */}
      {wp === 'rain' && (
        <div className="absolute inset-0">
          <div
            className="absolute -top-[20%] left-[30%] w-[50vw] h-[50vh] rounded-full blur-[130px] opacity-25"
            style={{
              background: 'radial-gradient(circle, #0284c7 0%, #0f172a 70%)',
            }}
          />
          {/* Animated Rain Streaks Simulation */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(56,189,248,0.2) 75%, rgba(255,255,255,0) 100%)',
              backgroundSize: '100% 60px',
            }}
          />
        </div>
      )}

      {/* 5. WALLPAPER PRESET: SOLAR SUNSET */}
      {wp === 'sunset' && (
        <div className="absolute inset-0">
          <div
            className="absolute -bottom-[25%] left-1/2 -translate-x-1/2 w-[80vw] h-[55vh] rounded-full blur-[160px] opacity-45"
            style={{
              background: 'radial-gradient(circle, #f97316 0%, #e11d48 50%, #4c1d95 80%, transparent 100%)',
            }}
          />
        </div>
      )}

      {/* 6. WALLPAPER PRESET: NORDIC FOREST */}
      {wp === 'forest' && (
        <div className="absolute inset-0">
          <div
            className="absolute -top-[10%] left-[20%] w-[60vw] h-[60vh] rounded-full blur-[150px] opacity-35"
            style={{
              background: 'radial-gradient(circle, #059669 0%, #064e3b 50%, transparent 75%)',
            }}
          />
        </div>
      )}

      {/* 7. WALLPAPER PRESET: AURORA (Default & Dynamic) */}
      {(wp === 'default' || wp === 'aurora') && settings.animationsEnabled && (
        <>
          <div
            className="absolute -top-[15%] left-[20%] w-[55vw] h-[45vh] rounded-full blur-[130px] opacity-25 transition-all duration-700 ease-out"
            style={{
              background: `radial-gradient(circle, ${activeSpace.accentColor} 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute -bottom-[20%] right-[10%] w-[50vw] h-[50vh] rounded-full blur-[150px] opacity-15 transition-all duration-700 ease-out"
            style={{
              background: `radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)`,
            }}
          />
        </>
      )}

      {/* 8. Interactive Pointer Spotlight */}
      <div
        className="absolute inset-0 opacity-40 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--accent-glow) 0%, transparent 60%)`,
          filter: 'blur(30px)',
        }}
      />

      {/* 9. Film Grain / Subtle Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.018] dark:opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};

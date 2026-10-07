import React, { useEffect, useMemo, useState } from 'react';
import { ChromeApiService } from '../../services/chrome-api';

interface SmartFaviconProps {
  url: string;
  size?: number;
  className?: string;
  categoryColor?: string;
  title?: string;
}

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export const getGoogleFavicon = (url: string, size = 128): string => {
  const domain = getDomain(url);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
};

export const SmartFavicon: React.FC<SmartFaviconProps> = ({
  url,
  size = 64,
  className = '',
  categoryColor = '#4af3a2',
  title = '',
}) => {
  const [stage, setStage] = useState(0);
  const domain = useMemo(() => getDomain(url), [url]);
  const letter = useMemo(() => {
    if (!domain) return '•';
    const clean = domain.split('.')[0] || domain;
    return clean.slice(0, 1).toUpperCase();
  }, [domain]);

  useEffect(() => {
    setStage(0);
  }, [url]);

  const primary = useMemo(() => ChromeApiService.getFaviconUrl(url, size), [url, size]);
  const secondary = useMemo(() => getGoogleFavicon(url, size), [url, size]);

  const frameStyle: React.CSSProperties = {
    width: size <= 32 ? 28 : size <= 64 ? 40 : 64,
    height: size <= 32 ? 28 : size <= 64 ? 40 : 64,
    borderColor: `color-mix(in srgb, ${categoryColor} 38%, transparent)`,
  };

  if (stage >= 2 || !primary) {
    return (
      <div
        title={title || domain}
        className={`shrink-0 grid place-items-center rounded-xl border bg-white/5 backdrop-blur-md font-bold ${className}`}
        style={{
          ...frameStyle,
          background: `linear-gradient(145deg, ${categoryColor}22, transparent)`,
          color: categoryColor,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,.12), 0 6px 16px -10px ${categoryColor}`,
        }}
      >
        <span style={{ fontSize: frameStyle.width && (frameStyle.width as number) > 40 ? 22 : 13 }}>{letter}</span>
      </div>
    );
  }

  const src = stage === 0 ? primary : secondary;

  return (
    <div
      title={title || domain}
      className={`shrink-0 grid place-items-center rounded-xl border bg-black/40 backdrop-blur-md p-1.5 shadow-sm ${className}`}
      style={frameStyle}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        draggable={false}
        className="w-full h-full object-contain rounded-lg"
        onError={() => setStage((s) => s + 1)}
      />
    </div>
  );
};

export default SmartFavicon;

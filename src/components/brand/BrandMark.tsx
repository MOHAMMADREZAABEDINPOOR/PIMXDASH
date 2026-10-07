import React from 'react';

export const BrandMark: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className="pimx-brand flex items-center gap-2.5" aria-label="PIMXDASH">
    <div className="pimx-brand-icon"><img src="/icons/pimxdash-mark.svg" alt="" /></div>
    {!compact && <div className="leading-none"><strong className="block text-sm tracking-[0.22em] text-text-primary">PIMX<span className="text-accent">DASH</span></strong><span className="block text-[9px] tracking-[0.28em] uppercase text-text-muted mt-1">Your digital orbit</span></div>}
  </div>
);

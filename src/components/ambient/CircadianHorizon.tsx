import React from 'react';
import { useTime } from '../../hooks/useTime';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBilingualNumber } from '../../i18n/useTranslation';

export const CircadianHorizon: React.FC = () => {
  const { settings } = useWorkspace();
  const { solarPhase } = useTime(settings.clockFormat === '24h', settings.showSeconds, settings.language);

  const phaseLabel = settings.language === 'fa' ? solarPhase.nameFa : solarPhase.name;
  const percentText = `${formatBilingualNumber(Math.round(solarPhase.progressPercent), settings.language)}%`;

  return (
    <div className="relative w-full group py-1 select-none z-10">
      {/* Subtle track bar */}
      <div className="relative h-[2px] w-full bg-border-subtle/30 overflow-hidden">
        {/* Glowing solar progression fill */}
        <div
          className="absolute top-0 h-full transition-all duration-1000 ease-out"
          style={{
            width: `${solarPhase.progressPercent}%`,
            background: `linear-gradient(90deg, transparent 0%, ${solarPhase.color} 80%, #ffffff 100%)`,
            boxShadow: `0 0 10px 1px ${solarPhase.color}`,
          }}
        />
      </div>

      {/* Floating Solar Checkpoint indicator on hover */}
      <div
        className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-out pointer-events-none opacity-0 group-hover:opacity-100"
        style={{
          left: `${solarPhase.progressPercent}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide glass-panel shadow-glass text-text-primary whitespace-nowrap">
          <span
            className="w-1.5 h-1.5 rounded-full animate-ping"
            style={{ backgroundColor: solarPhase.color }}
          />
          <span>{phaseLabel}</span>
          <span className="text-text-muted">• {percentText}</span>
        </div>
      </div>
    </div>
  );
};

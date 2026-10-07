export const WIDGET_STYLE_PALETTES = [
  ['Terminal Green', '#4af3a2'], ['Ice Cyan', '#22d3ee'], ['Ultraviolet', '#a78bfa'],
  ['Signal Amber', '#fbbf24'], ['Alert Rose', '#fb7185'], ['Electric Blue', '#60a5fa'],
  ['Solar Orange', '#fb923c'], ['Silver', '#cbd5e1'],
] as const;

export const WIDGET_STYLE_SURFACES = ['Glass', 'Terminal', 'Outline', 'Glow', 'Solid'] as const;

export const WIDGET_STYLES = WIDGET_STYLE_SURFACES.flatMap((surface, surfaceIndex) =>
  WIDGET_STYLE_PALETTES.map(([palette, color], paletteIndex) => ({
    id: surfaceIndex * 8 + paletteIndex,
    name: `${palette} / ${surface}`,
    color,
    surface: surface.toLowerCase(),
  })),
);

export const WIDGET_STYLES_KEY = 'widget_styles_v1';
export const WIDGET_STYLE_EVENT = 'pimxdash:widget-styles';

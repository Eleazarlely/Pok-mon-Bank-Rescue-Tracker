import React from 'react';

interface RibbonEmblemProps {
  ribbonId: string;
  label: string;
}

interface RibbonPalette {
  outer: string;
  inner: string;
  tails: string;
  accent: string;
}

const RIBBON_PALETTES: Record<string, RibbonPalette> = {
  'cinta-campeon-hoenn': {
    outer: '#DC2626',
    inner: '#F59E0B',
    tails: '#B91C1C',
    accent: '#FEF3C7',
  },
  'cinta-tierra-colosseum': {
    outer: '#16A34A',
    inner: '#84CC16',
    tails: '#15803D',
    accent: '#ECFCCB',
  },
  'cinta-artista-hoenn': {
    outer: '#EC4899',
    inner: '#38BDF8',
    tails: '#BE185D',
    accent: '#FCE7F3',
  },
  'cinta-campeon-sinnoh': {
    outer: '#2563EB',
    inner: '#E2E8F0',
    tails: '#1D4ED8',
    accent: '#DBEAFE',
  },
  'cinta-leyenda-hgss': {
    outer: '#D97706',
    inner: '#F8FAFC',
    tails: '#92400E',
    accent: '#FEF08A',
  },
  'cinta-real-magnifica': {
    outer: '#7C3AED',
    inner: '#FBBF24',
    tails: '#5B21B6',
    accent: '#FDE68A',
  },
  'cinta-campeon-kalos': {
    outer: '#0284C7',
    inner: '#F59E0B',
    tails: '#0369A1',
    accent: '#E0F2FE',
  },
  'cinta-campeon-oras': {
    outer: '#EA580C',
    inner: '#FACC15',
    tails: '#C2410C',
    accent: '#FFEDD5',
  },
  'cinta-estrella-concurso': {
    outer: '#E11D48',
    inner: '#FDE047',
    tails: '#9F1239',
    accent: '#FFE4E6',
  },
  'cinta-campeon-alola': {
    outer: '#0D9488',
    inner: '#F59E0B',
    tails: '#115E59',
    accent: '#CCFBF1',
  },
  'cinta-arbol-batalla-maestro': {
    outer: '#B91C1C',
    inner: '#94A3B8',
    tails: '#7F1D1D',
    accent: '#F1F5F9',
  },
  'cinta-batalla-royal': {
    outer: '#9333EA',
    inner: '#38BDF8',
    tails: '#6B21A8',
    accent: '#F3E8FF',
  },
};

const DEFAULT_PALETTE: RibbonPalette = {
  outer: '#D97706',
  inner: '#FBBF24',
  tails: '#92400E',
  accent: '#FEF3C7',
};

export const RibbonEmblem: React.FC<RibbonEmblemProps> = ({ ribbonId, label }) => {
  const p = RIBBON_PALETTES[ribbonId] ?? DEFAULT_PALETTE;

  return (
    <div
      title={label}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-800 bg-gray-950 p-1.5"
    >
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-full w-full">
        {/* Ribbon tails */}
        <path d="M16 29L12 43L19 39L23 44L24 31H16Z" fill={p.tails} />
        <path d="M32 29L36 43L29 39L25 44L24 31H32Z" fill={p.tails} />
        {/* Outer rosette */}
        <circle cx="24" cy="20" r="14" fill={p.outer} stroke={p.accent} strokeWidth="1.5" />
        {/* Inner medallion */}
        <circle cx="24" cy="20" r="8.5" fill={p.inner} />
        {/* Center star/gem */}
        <path
          d="M24 14.5L25.6 18.1L29.5 18.6L26.6 21.2L27.4 25L24 23.1L20.6 25L21.4 21.2L18.5 18.6L22.4 18.1L24 14.5Z"
          fill={p.accent}
        />
      </svg>
    </div>
  );
};

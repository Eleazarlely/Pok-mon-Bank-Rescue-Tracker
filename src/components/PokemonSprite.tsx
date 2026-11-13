import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ResolvedCardSprite } from '../services/pokeapi';

interface SingleSpriteProps {
  sprite: ResolvedCardSprite;
  compact?: boolean;
  loading?: boolean;
}

const SingleSprite: React.FC<SingleSpriteProps> = ({
  sprite,
  compact = false,
  loading = false,
}) => {
  const [failed, setFailed] = useState(false);

  const boxSize = compact ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-18 w-18 sm:h-20 sm:w-20';
  const showFallback = !loading && (!sprite.url || failed);

  return (
    <div
      title={
        sprite.pokedexId
          ? `#${String(sprite.pokedexId).padStart(3, '0')} · ${sprite.alt}`
          : sprite.alt
      }
      className={`group/sprite relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-b from-gray-900 to-gray-950 shadow-inner ${boxSize} ${
        sprite.isShiny ? 'border-amber-500/45' : 'border-gray-800'
      }`}
    >
      {loading && !sprite.url ? (
        <div
          aria-hidden="true"
          className="h-9 w-9 animate-pulse rounded-full bg-gray-800/80"
        />
      ) : !showFallback && sprite.url ? (
        <img
          src={sprite.url}
          alt={sprite.isShiny ? `${sprite.alt} variocolor` : sprite.alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-1 transition-transform duration-150 group-hover/sprite:scale-105 [image-rendering:pixelated]"
        />
      ) : (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          aria-hidden="true"
          className="h-7 w-7 opacity-60"
        >
          <circle cx="24" cy="24" r="18" stroke="#6B7280" strokeWidth="3" />
          <path d="M6 24C6 14.059 14.059 6 24 6C33.941 6 42 14.059 42 24H6Z" fill="#374151" />
          <circle cx="24" cy="24" r="5" fill="#111827" stroke="#9CA3AF" strokeWidth="2.5" />
        </svg>
      )}

      {sprite.pokedexId !== null && (
        <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-gray-950/85 px-1 font-mono text-[9px] font-medium tabular-nums text-gray-400">
          #{String(sprite.pokedexId).padStart(3, '0')}
        </span>
      )}

      {sprite.isShiny && (
        <span
          aria-label="Forma Shiny"
          className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-950/90 text-amber-400"
        >
          <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
        </span>
      )}
    </div>
  );
};

interface PokemonSpriteGroupProps {
  sprites: ResolvedCardSprite[];
  loading?: boolean;
}

export const PokemonSpriteGroup: React.FC<PokemonSpriteGroupProps> = ({
  sprites,
  loading = false,
}) => {
  if (sprites.length === 0) return null;

  const isMulti = sprites.length > 1;

  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      {sprites.map((sprite) => (
        <SingleSprite
          key={sprite.query}
          sprite={sprite}
          compact={isMulti}
          loading={loading}
        />
      ))}
    </div>
  );
};

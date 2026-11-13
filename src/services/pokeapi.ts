import { useEffect, useMemo, useState } from 'react';

export interface PokeApiPokemonSprite {
  query: string;
  pokedexId: number;
  name: string;
  frontDefault: string | null;
  frontShiny: string | null;
  artworkDefault: string | null;
  artworkShiny: string | null;
}

const POKEAPI_BASE = 'https://pokeapi.co/api/v2/pokemon';
const CACHE_STORAGE_KEY = 'pbrt_pokeapi_sprites_v1';

const memoryCache = new Map<string, PokeApiPokemonSprite>();
const inFlightRequests = new Map<string, Promise<PokeApiPokemonSprite | null>>();

function loadStorageCache(): Record<string, PokeApiPokemonSprite> {
  try {
    const raw = window.localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, PokeApiPokemonSprite>;
    }
    return {};
  } catch {
    return {};
  }
}

function saveToStorageCache(entry: PokeApiPokemonSprite) {
  try {
    const existing = loadStorageCache();
    existing[entry.query] = entry;
    window.localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

// Hydrate memory cache once on module load
if (typeof window !== 'undefined') {
  const stored = loadStorageCache();
  for (const [key, val] of Object.entries(stored)) {
    memoryCache.set(key, val);
  }
}

const SPECIAL_SLUG_MAP: Array<[RegExp, string]> = [
  [/pikachu\s+coqueta|cosplay\s+pikachu/i, 'pikachu-belle'],
  [/pichu\s+picoreja|spiky-eared\s+pichu/i, 'pichu'],
  [/greninja\s+de\s+ash|ash-greninja/i, 'greninja-ash'],
  [/\bdeoxys\b/i, 'deoxys-normal'],
  [/\bgiratina\b/i, 'giratina-altered'],
  [/\bzygarde\b/i, 'zygarde-50'],
  [/\bho-oh\b/i, 'ho-oh'],
];

const KNOWN_SPECIES_PATTERN =
  /\b(mew|celebi|jirachi|deoxys|arceus|victini|kyogre|groudon|rayquaza|giratina|dialga|palkia|reshiram|zekrom|xerneas|yveltal|zygarde|ho-oh|lugia|poipole|blacephalon|stakataka|pichu|pikachu|spinda|greninja|vivillon)\b/gi;

export function extractPokemonQueries(nameOrId: string): string[] {
  const trimmed = nameOrId.trim();
  if (!trimmed) return [];

  // Direct numeric Pokédex ID or exact PokeAPI slug
  if (/^\d+$/.test(trimmed)) {
    return [trimmed];
  }

  const results: string[] = [];
  const seen = new Set<string>();

  const pushUnique = (slug: string) => {
    const normalized = slug.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      results.push(normalized);
    }
  };

  // Match special form rules first
  for (const [pattern, slug] of SPECIAL_SLUG_MAP) {
    if (pattern.test(trimmed)) {
      pushUnique(slug);
    }
  }

  // Extract standard Pokémon species names in order
  const matches = trimmed.match(KNOWN_SPECIES_PATTERN);
  if (matches) {
    for (const match of matches) {
      const lower = match.toLowerCase();
      if (lower === 'pikachu' && seen.has('pikachu-belle')) continue;
      if (lower === 'greninja' && seen.has('greninja-ash')) continue;
      if (lower === 'deoxys') {
        pushUnique('deoxys-normal');
      } else if (lower === 'giratina') {
        pushUnique('giratina-altered');
      } else if (lower === 'zygarde') {
        pushUnique('zygarde-50');
      } else {
        pushUnique(lower);
      }
      if (results.length >= 3) break;
    }
  }

  // Fallback: sanitize the first word as a PokeAPI slug if nothing matched
  if (results.length === 0) {
    const fallbackSlug = trimmed
      .split(/[,(]/)[0]
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-');
    if (fallbackSlug) {
      pushUnique(fallbackSlug);
    }
  }

  return results.slice(0, 3);
}

interface RawPokeApiResponse {
  id: number;
  name: string;
  sprites?: {
    front_default?: string | null;
    front_shiny?: string | null;
    other?: {
      'official-artwork'?: {
        front_default?: string | null;
        front_shiny?: string | null;
      };
    };
  };
}

export async function fetchPokemonFromPokeAPI(
  nameOrId: string
): Promise<PokeApiPokemonSprite | null> {
  const key = nameOrId.trim().toLowerCase();
  if (!key) return null;

  const cached = memoryCache.get(key);
  if (cached) return cached;

  const existingPromise = inFlightRequests.get(key);
  if (existingPromise) return existingPromise;

  const request = (async () => {
    try {
      const response = await fetch(`${POKEAPI_BASE}/${encodeURIComponent(key)}`);
      if (!response.ok) return null;
      const data = (await response.json()) as RawPokeApiResponse;

      const entry: PokeApiPokemonSprite = {
        query: key,
        pokedexId: data.id,
        name: data.name,
        frontDefault: data.sprites?.front_default ?? null,
        frontShiny: data.sprites?.front_shiny ?? null,
        artworkDefault: data.sprites?.other?.['official-artwork']?.front_default ?? null,
        artworkShiny: data.sprites?.other?.['official-artwork']?.front_shiny ?? null,
      };

      memoryCache.set(key, entry);
      saveToStorageCache(entry);
      return entry;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, request);
  return request;
}

export interface ResolvedCardSprite {
  query: string;
  pokedexId: number | null;
  url: string | null;
  alt: string;
  isShiny: boolean;
}

export function usePokemonSprites(pokemonNameOrId: string, preferShiny: boolean) {
  const queries = useMemo(() => extractPokemonQueries(pokemonNameOrId), [pokemonNameOrId]);
  const queriesKey = queries.join('|');

  const [fetched, setFetched] = useState<Array<PokeApiPokemonSprite | null>>(() =>
    queries.map((q) => memoryCache.get(q) ?? null)
  );
  const [loading, setLoading] = useState<boolean>(() =>
    queries.some((q) => !memoryCache.has(q))
  );

  useEffect(() => {
    let cancelled = false;

    const allCached = queries.every((q) => memoryCache.has(q));
    if (allCached) {
      setFetched(queries.map((q) => memoryCache.get(q) ?? null));
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(queries.map((q) => fetchPokemonFromPokeAPI(q))).then((results) => {
      if (!cancelled) {
        setFetched(results);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [queriesKey]);

  const sprites: ResolvedCardSprite[] = useMemo(() => {
    return queries.map((query, index) => {
      const data = fetched[index];
      if (!data) {
        return {
          query,
          pokedexId: null,
          url: null,
          alt: query,
          isShiny: preferShiny,
        };
      }

      const useShinyUrl = preferShiny && Boolean(data.frontShiny);
      const url = useShinyUrl ? data.frontShiny : data.frontDefault;

      return {
        query,
        pokedexId: data.pokedexId,
        url,
        alt: data.name,
        isShiny: useShinyUrl,
      };
    });
  }, [queries, fetched, preferShiny]);

  return { sprites, loading };
}

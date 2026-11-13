import React from 'react';
import { Check } from 'lucide-react';
import { Exclusivo, Legendario, Singular } from '../data/database';
import { usePokemonSprites } from '../services/pokeapi';
import { ItemNoteEditor } from './ItemNoteEditor';
import { PokemonSpriteGroup } from './PokemonSprite';
import { ShinyBadge } from './ShinyBadge';

type CardItem =
  | { kind: 'singular'; data: Singular }
  | { kind: 'legendario'; data: Legendario }
  | { kind: 'exclusivo'; data: Exclusivo };

interface TrackerCardProps {
  item: CardItem;
  isCompleted: boolean;
  note: string;
  onToggle: (id: string) => void;
  onSaveNote: (id: string, text: string) => void;
}

export const TrackerCard: React.FC<TrackerCardProps> = ({
  item,
  isCompleted,
  note,
  onToggle,
  onSaveNote,
}) => {
  const id = item.data.id;
  const isCritical = item.kind === 'exclusivo' && item.data.isCritical;

  const title =
    item.kind === 'singular'
      ? item.data.pokemon
      : item.kind === 'legendario'
      ? item.data.pokemonDisponible
      : item.data.especieObjeto;

  const preferShiny =
    item.kind !== 'exclusivo' &&
    (item.data.shinyStatus === 'Libre' || item.data.shinyStatus === 'Especial');

  const { sprites, loading: spritesLoading } = usePokemonSprites(title, preferShiny);

  const borderClasses = isCritical
    ? 'border-2 border-red-500 animate-pulse bg-gray-900'
    : isCompleted
    ? 'border border-gray-800 bg-gray-900/70'
    : 'border border-gray-800 bg-gray-900 hover:border-amber-500/40';

  return (
    <article
      className={`group rounded-xl p-4 sm:p-5 transition-all duration-150 ${borderClasses} ${
        isCompleted ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={`Marcar ${title} como completado`}
          onClick={() => onToggle(id)}
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
            isCompleted
              ? 'border-amber-400 bg-amber-500 text-gray-950'
              : isCritical
              ? 'border-red-500/70 bg-gray-950 text-transparent hover:border-red-400'
              : 'border-gray-700 bg-gray-950 text-transparent hover:border-amber-400'
          }`}
        >
          <Check className="h-6 w-6 stroke-[2.75]" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3
              className={`text-base sm:text-lg font-semibold leading-snug text-gray-100 ${
                isCompleted ? 'line-through text-gray-400' : ''
              }`}
            >
              {isCritical && (
                <span className="mr-1.5 inline-block" aria-label="Alerta de cuarentena">
                  ⚠️
                </span>
              )}
              {title}
            </h3>

            {item.kind !== 'exclusivo' ? (
              <ShinyBadge status={item.data.shinyStatus} />
            ) : isCritical ? (
              <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
                <span aria-hidden="true">⚠️</span>
                <span>Transferencia Bloqueada</span>
              </span>
            ) : (
              <span className="inline-flex items-center whitespace-nowrap shrink-0 rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-300">
                Transferible
              </span>
            )}
          </div>

          {sprites.length > 0 && (
            <div className="mt-3">
              <PokemonSpriteGroup sprites={sprites} loading={spritesLoading} />
            </div>
          )}

          {item.kind === 'singular' && (
            <div className="mt-3 space-y-2 text-sm text-gray-300">
              <div className="text-xs text-amber-400 font-medium">
                {item.data.juegoOptimo}
              </div>
              <p className="leading-relaxed">
                <span className="text-gray-400 font-medium">Método: </span>
                {item.data.metodoRequerido}
              </p>
              <p className="text-xs leading-relaxed text-gray-400">
                <span className="text-gray-300 font-medium">Restricciones: </span>
                {item.data.restriccionesActivacion}
              </p>
            </div>
          )}

          {item.kind === 'legendario' && (
            <div className="mt-3 space-y-2 text-sm text-gray-300">
              <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-medium">
                <span>{item.data.generacion}</span>
                <span aria-hidden="true" className="text-gray-600">
                  ·
                </span>
                <span>{item.data.juego}</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-300">
                <span className="text-gray-400 font-medium">Observaciones: </span>
                {item.data.metodoObservaciones}
              </p>
            </div>
          )}

          {item.kind === 'exclusivo' && (
            <div className="mt-3 space-y-2 text-sm text-gray-300">
              <div className="text-xs font-medium text-amber-400">
                {item.data.categoria}
              </div>
              <p className="leading-relaxed">
                <span className="text-gray-400 font-medium">Origen / Legalidad: </span>
                {item.data.metodoLegalidad}
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isCritical ? 'font-medium text-red-300' : 'text-gray-400'
                }`}
              >
                <span className={isCritical ? 'text-red-400 font-semibold' : 'text-gray-300 font-medium'}>
                  Estado en Bank / HOME:{' '}
                </span>
                {item.data.estadoHome}
              </p>
            </div>
          )}

          <ItemNoteEditor
            itemId={id}
            itemTitle={title}
            note={note}
            placeholder={
              item.kind === 'exclusivo'
                ? 'Ej. En qué cartucho o caja se encuentra resguardado...'
                : 'Ej. Naturaleza Sincronía, Ball objetivo o contador de Soft Resets...'
            }
            onSaveNote={onSaveNote}
          />
        </div>
      </div>
    </article>
  );
};

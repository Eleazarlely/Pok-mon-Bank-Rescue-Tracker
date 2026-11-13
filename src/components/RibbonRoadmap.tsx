import React, { useMemo } from 'react';
import { Award, Check } from 'lucide-react';
import { Cinta } from '../data/database';
import { ItemNoteEditor } from './ItemNoteEditor';
import { RibbonEmblem } from './RibbonEmblem';

interface RibbonRoadmapProps {
  cintas: Cinta[];
  completedIds: Set<string>;
  notes: Record<string, string>;
  onToggle: (id: string) => void;
  onSaveNote: (id: string, text: string) => void;
}

const GENERATION_META: Record<string, { region: string; subtitle: string; order: number }> = {
  'Gen 3': {
    region: 'Hoenn & Orre (GBA / GameCube)',
    subtitle: 'Inicio del Ribbon Master antes de migrar por Parque Compi',
    order: 1,
  },
  'Gen 4': {
    region: 'Sinnoh & Johto (Nintendo DS)',
    subtitle: 'Torre Batalla, Sindicato de Cintas y Monte Plateado',
    order: 2,
  },
  'Gen 6': {
    region: 'Kalos & Hoenn 3DS (Nintendo 3DS)',
    subtitle: 'Primera parada compatible directamente con Pokémon Bank',
    order: 3,
  },
  'Gen 7': {
    region: 'Alola (Última etapa previa a Pokémon HOME)',
    subtitle: 'Árbol de Combate y Estadio Royal antes del traspaso final',
    order: 4,
  },
};

export const RibbonRoadmap: React.FC<RibbonRoadmapProps> = ({
  cintas,
  completedIds,
  notes,
  onToggle,
  onSaveNote,
}) => {
  const grouped = useMemo(() => {
    const map = new Map<string, Cinta[]>();
    for (const cinta of cintas) {
      const list = map.get(cinta.generacion) ?? [];
      list.push(cinta);
      map.set(cinta.generacion, list);
    }

    return Array.from(map.entries()).sort((a, b) => {
      const orderA = GENERATION_META[a[0]]?.order ?? 99;
      const orderB = GENERATION_META[b[0]]?.order ?? 99;
      return orderA - orderB;
    });
  }, [cintas]);

  if (grouped.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
        <p className="text-sm text-gray-400">
          No hay cintas que coincidan con el filtro actual.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      {grouped.map(([gen, items], groupIndex) => {
        const completedInGen = items.filter((c) => completedIds.has(c.id)).length;
        const meta = GENERATION_META[gen] ?? {
          region: gen,
          subtitle: 'Etapa de campeonato',
          order: groupIndex + 1,
        };
        const isGenComplete = completedInGen === items.length && items.length > 0;
        const isLastGroup = groupIndex === grouped.length - 1;

        return (
          <section key={gen} aria-labelledby={`gen-heading-${gen}`} className="relative pl-8 sm:pl-11">
            {/* Vertical timeline connector */}
            {!isLastGroup && (
              <div
                aria-hidden="true"
                className="absolute left-3.5 sm:left-4.5 top-9 bottom-[-2rem] w-px bg-gray-800"
              />
            )}

            {/* Generation node marker */}
            <div
              aria-hidden="true"
              className={`absolute left-0 top-1 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 font-mono text-xs font-bold ${
                isGenComplete
                  ? 'border-amber-400 bg-amber-500 text-gray-950'
                  : 'border-amber-500/60 bg-gray-900 text-amber-400'
              }`}
            >
              {isGenComplete ? <Check className="h-4 w-4 stroke-[2.75]" /> : meta.order}
            </div>

            {/* Generation header */}
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between border-b border-gray-800 pb-3">
              <div>
                <h2
                  id={`gen-heading-${gen}`}
                  className="text-lg sm:text-xl font-bold text-gray-100 flex items-center gap-2"
                >
                  <span className="text-amber-400">{gen}</span>
                  <span aria-hidden="true" className="text-gray-600">
                    ·
                  </span>
                  <span>{meta.region}</span>
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm text-gray-400">{meta.subtitle}</p>
              </div>
              <div className="font-mono text-xs font-semibold tabular-nums text-amber-400 shrink-0">
                {completedInGen} / {items.length} cintas
              </div>
            </div>

            {/* Ribbon cards inside this generation */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {items.map((cinta) => {
                const isDone = completedIds.has(cinta.id);

                return (
                  <article
                    key={cinta.id}
                    className={`rounded-xl border p-4 transition-all duration-150 ${
                      isDone
                        ? 'border-gray-800 bg-gray-900/70 opacity-50'
                        : 'border-gray-800 bg-gray-900 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isDone}
                        aria-label={`Marcar ${cinta.nombre} como completada`}
                        onClick={() => onToggle(cinta.id)}
                        className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                          isDone
                            ? 'border-amber-400 bg-amber-500 text-gray-950'
                            : 'border-gray-700 bg-gray-950 text-transparent hover:border-amber-400'
                        }`}
                      >
                        <Check className="h-6 w-6 stroke-[2.75]" aria-hidden="true" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <RibbonEmblem ribbonId={cinta.id} label={cinta.nombre} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h3
                                className={`text-base font-semibold text-gray-100 ${
                                  isDone ? 'line-through text-gray-400' : ''
                                }`}
                              >
                                {cinta.nombre}
                              </h3>
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 shrink-0">
                                <Award className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                <span>«{cinta.tituloOtorgado}»</span>
                              </span>
                            </div>

                            <div className="mt-1 text-xs font-medium text-gray-400">
                              {cinta.juegoObtencion}
                            </div>
                          </div>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-gray-300">
                          {cinta.metodo}
                        </p>

                        <ItemNoteEditor
                          itemId={cinta.id}
                          itemTitle={cinta.nombre}
                          note={notes[cinta.id] ?? ''}
                          placeholder="Ej. Pokémon en progreso, equipo usado o paso pendiente..."
                          onSaveNote={onSaveNote}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

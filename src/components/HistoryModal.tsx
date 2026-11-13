import React, { useEffect, useMemo } from 'react';
import { CheckCircle2, History, RotateCcw, StickyNote, Trash2, X } from 'lucide-react';

export type HistoryActionType =
  | 'completed'
  | 'uncompleted'
  | 'note_added'
  | 'note_updated'
  | 'note_deleted'
  | 'reset_progress';

export interface HistoryLogEntry {
  id: string;
  itemId: string;
  itemTitle: string;
  categoryLabel: string;
  action: HistoryActionType;
  detail?: string;
  timestamp: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  entries: HistoryLogEntry[];
  onClose: () => void;
  onClearHistory: () => void;
}

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dateTimeFormatter.format(date);
}

const ACTION_LABEL: Record<HistoryActionType, string> = {
  completed: 'Completado',
  uncompleted: 'Desmarcado',
  note_added: 'Nota añadida',
  note_updated: 'Nota editada',
  note_deleted: 'Nota eliminada',
  reset_progress: 'Progreso reiniciado',
};

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  entries,
  onClose,
  onClearHistory,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const lastCompleted = useMemo(
    () => entries.find((entry) => entry.action === 'completed') ?? null,
    [entries]
  );

  const lastNote = useMemo(
    () =>
      entries.find(
        (entry) => entry.action === 'note_added' || entry.action === 'note_updated'
      ) ?? null,
    [entries]
  );

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 border-b border-gray-800 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <div>
              <h2 id="history-modal-title" className="text-base sm:text-lg font-bold text-gray-100">
                Historial de Actividad (Changelog)
              </h2>
              <p className="text-xs text-gray-400">
                Registro local de capturas completadas y notas guardadas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Highlight Summary: Last Completed & Last Note */}
        <div className="grid grid-cols-1 gap-4 border-b border-gray-800 bg-gray-950/60 px-5 py-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-gray-400">
              Último objetivo completado
            </div>
            {lastCompleted ? (
              <div className="mt-1">
                <div className="text-sm font-semibold text-amber-400 truncate">
                  {lastCompleted.itemTitle}
                </div>
                <div className="mt-0.5 font-mono text-xs tabular-nums text-gray-300">
                  {formatTimestamp(lastCompleted.timestamp)}
                </div>
              </div>
            ) : (
              <div className="mt-1 text-xs text-gray-500">Sin objetivos completados aún</div>
            )}
          </div>

          <div className="border-t border-gray-800 pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
            <div className="text-xs font-medium text-gray-400">
              Última nota guardada
            </div>
            {lastNote ? (
              <div className="mt-1">
                <div className="text-sm font-semibold text-amber-400 truncate">
                  {lastNote.itemTitle}
                </div>
                <div className="mt-0.5 font-mono text-xs tabular-nums text-gray-300">
                  {formatTimestamp(lastNote.timestamp)}
                </div>
              </div>
            ) : (
              <div className="mt-1 text-xs text-gray-500">Sin notas registradas aún</div>
            )}
          </div>
        </div>

        {/* Scrollable Entries List */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {entries.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400">
                Todavía no hay movimientos en el historial.
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Marca cualquier Pokémon o cinta como completado, o guarda una nota personal para
                registrar la fecha y hora aquí.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800/80">
              {entries.map((entry) => {
                const isCompleted = entry.action === 'completed';
                const isNote =
                  entry.action === 'note_added' ||
                  entry.action === 'note_updated' ||
                  entry.action === 'note_deleted';

                return (
                  <li key={entry.id} className="flex items-start gap-3 py-3">
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" aria-hidden="true" />
                      ) : isNote ? (
                        <StickyNote className="h-4 w-4 text-amber-400" aria-hidden="true" />
                      ) : (
                        <RotateCcw className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <div className="text-sm font-semibold text-gray-100">
                          <span className="text-amber-400">{ACTION_LABEL[entry.action]}</span>
                          <span aria-hidden="true" className="mx-1.5 text-gray-600">
                            ·
                          </span>
                          <span>{entry.itemTitle}</span>
                        </div>
                        <time
                          dateTime={entry.timestamp}
                          className="font-mono text-xs tabular-nums text-gray-400 shrink-0"
                        >
                          {formatTimestamp(entry.timestamp)}
                        </time>
                      </div>

                      <div className="mt-0.5 text-xs text-gray-400">
                        {entry.categoryLabel}
                      </div>

                      {entry.detail && (
                        <p className="mt-1.5 rounded-md bg-gray-950 px-2.5 py-1.5 text-xs text-gray-300 break-words">
                          «{entry.detail}»
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-gray-800 bg-gray-900 px-5 py-3.5">
          {entries.length > 0 ? (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-950/30"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Limpiar historial</span>
            </button>
          ) : (
            <span className="text-xs text-gray-500">Guardado en localStorage</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[38px] items-center rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-gray-950 transition-colors hover:bg-amber-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

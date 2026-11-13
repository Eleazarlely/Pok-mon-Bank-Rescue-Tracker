import React, { useEffect, useRef, useState } from 'react';
import { Check, Pencil, User, X } from 'lucide-react';

interface TrainerBannerProps {
  trainerName: string;
  onSaveName: (name: string) => void;
}

export const TrainerBanner: React.FC<TrainerBannerProps> = ({
  trainerName,
  onSaveName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(trainerName);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraft(trainerName);
  }, [trainerName]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draft.trim();
    onSaveName(cleaned);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(trainerName);
    setIsEditing(false);
  };

  if (isEditing || !trainerName) {
    return (
      <div className="mb-5 flex flex-col gap-3 border-b border-gray-800/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5 text-sm text-gray-300">
          <User className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
          <span className="font-medium">
            {trainerName ? 'Cambiar nombre de entrenador:' : 'Bienvenido, Entrenador'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            maxLength={24}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tu nombre (ej. Elelely)"
            aria-label="Nombre de entrenador"
            className="h-9 w-52 rounded-lg border border-gray-700 bg-gray-900 px-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={draft.trim().length === 0 && !trainerName}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-gray-950 transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Guardar</span>
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Cancelar edición de nombre"
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Cancelar</span>
            </button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <User className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="font-display text-base sm:text-lg font-medium text-gray-200 truncate">
          Bienvenido, <span className="font-bold text-amber-400">{trainerName}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-amber-500/40 hover:text-amber-300 whitespace-nowrap"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Cambiar nombre</span>
      </button>
    </div>
  );
};

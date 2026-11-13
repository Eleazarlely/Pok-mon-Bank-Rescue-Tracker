import React, { useEffect, useRef, useState } from 'react';
import { Pencil, StickyNote, Trash2 } from 'lucide-react';

interface ItemNoteEditorProps {
  itemId: string;
  itemTitle: string;
  note: string;
  placeholder?: string;
  onSaveNote: (id: string, text: string) => void;
}

export const ItemNoteEditor: React.FC<ItemNoteEditorProps> = ({
  itemId,
  itemTitle,
  note,
  placeholder = 'Ej. Naturaleza objetivo, intentos de Soft Reset o juego actual...',
  onSaveNote,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setDraft(note);
  }, [note]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  const handleSave = () => {
    onSaveNote(itemId, draft.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(note);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setDraft('');
    onSaveNote(itemId, '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="mt-3.5 border-t border-gray-800 pt-3">
        <label
          htmlFor={`note-input-${itemId}`}
          className="block text-xs font-medium text-amber-400"
        >
          Nota personal · {itemTitle}
        </label>
        <textarea
          ref={textareaRef}
          id={`note-input-${itemId}`}
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="mt-1.5 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs sm:text-sm text-gray-100 placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex min-h-[36px] items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-gray-950 transition-colors hover:bg-amber-400"
            >
              Guardar nota
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex min-h-[36px] items-center rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              Cancelar
            </button>
          </div>

          {note && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label={`Eliminar nota de ${itemTitle}`}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-950/50 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Eliminar</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (note) {
    return (
      <div className="mt-3.5 border-t border-gray-800 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2 text-xs sm:text-sm text-amber-200/90">
            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden="true" />
            <p className="whitespace-pre-wrap break-words leading-relaxed">{note}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label={`Editar nota de ${itemTitle}`}
            className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-950 px-2.5 py-1 text-xs font-medium text-gray-300 transition-colors hover:border-amber-500/40 hover:text-amber-300"
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            <span>Editar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3.5 border-t border-gray-800/80 pt-2.5">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800/70 hover:text-amber-300"
      >
        <StickyNote className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Añadir nota personal</span>
      </button>
    </div>
  );
};

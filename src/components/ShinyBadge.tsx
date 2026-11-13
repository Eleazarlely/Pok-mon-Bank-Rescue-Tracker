import React from 'react';
import { Lock, Sparkles, Star } from 'lucide-react';

interface ShinyBadgeProps {
  status: 'Libre' | 'Bloqueado' | 'Especial';
}

export const ShinyBadge: React.FC<ShinyBadgeProps> = ({ status }) => {
  if (status === 'Libre') {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white">
        <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Libre</span>
      </span>
    );
  }

  if (status === 'Bloqueado') {
    return (
      <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Bloqueado</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
      <Star className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>Especial</span>
    </span>
  );
};

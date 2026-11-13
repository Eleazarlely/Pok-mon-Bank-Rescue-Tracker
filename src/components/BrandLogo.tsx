import React, { useState } from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-9 w-9 sm:h-10 sm:w-10 rounded-xl',
  lg: 'h-12 w-12 rounded-2xl',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-amber-400/50 bg-black p-0.5 shadow-sm shadow-amber-500/10 ${SIZE_CLASSES[size]}`}
    >
      {!imgError ? (
        <img
          src="/assets/aistudio/megadragonite_c646f532.jpg"
          alt="Logo de Pokémon Bank Rescue Tracker"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full rounded-[9px] object-cover object-center"
        />
      ) : (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
          className="h-full w-full p-1"
        >
          <circle cx="32" cy="32" r="24" stroke="#F59E0B" strokeWidth="4" />
          <path d="M8 32C8 18.745 18.745 8 32 8C45.255 8 56 18.745 56 32H8Z" fill="#F59E0B" />
          <circle cx="32" cy="32" r="8" fill="#030712" stroke="#F8FAFC" strokeWidth="3" />
        </svg>
      )}
    </span>
  );
};

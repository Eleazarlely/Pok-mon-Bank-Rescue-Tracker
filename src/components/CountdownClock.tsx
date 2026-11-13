import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const SHUTDOWN_TARGET = new Date('2027-02-26T23:59:59').getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calculateTimeLeft(): TimeLeft {
  const diff = SHUTDOWN_TARGET - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, expired: false };
}

const pad = (n: number) => String(n).padStart(2, '0');

export const CountdownClock: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const isUrgent = timeLeft.days < 100;

  return (
    <div
      className="flex items-center gap-2 whitespace-nowrap shrink-0"
      aria-label="Cuenta regresiva hacia el cierre de Pokémon Bank el 26 de febrero de 2027"
    >
      <Clock
        className={`h-4 w-4 shrink-0 ${isUrgent ? 'text-red-500' : 'text-amber-400'}`}
        aria-hidden="true"
      />
      {timeLeft.expired ? (
        <span className="font-mono text-xs sm:text-sm font-semibold text-red-500 tabular-nums">
          Servidores cerrados · 26 Feb 2027
        </span>
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="hidden lg:inline text-xs text-gray-400">Cierre 26/02/27:</span>
          <span
            className={`font-mono text-xs sm:text-sm font-semibold tabular-nums tracking-tight ${
              isUrgent ? 'text-red-500' : 'text-amber-400'
            }`}
          >
            {timeLeft.days}d {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m {pad(timeLeft.seconds)}s
          </span>
        </div>
      )}
    </div>
  );
};

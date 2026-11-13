import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface CategoryStat {
  key: 'singulares' | 'cintas' | 'legendarios' | 'exclusivos';
  name: string;
  completados: number;
  pendientes: number;
  total: number;
}

export interface GenerationStat {
  gen: string;
  region: string;
  completados: number;
  total: number;
  porcentaje: number;
}

interface RescueStatsPanelProps {
  categories: CategoryStat[];
  generations: GenerationStat[];
  onSelectCategory?: (key: CategoryStat['key']) => void;
}

type StatsChartView = 'category' | 'generation';

const WINDOW_START_MS = new Date('2026-02-26T00:00:00').getTime();
const SHUTDOWN_TARGET_MS = new Date('2027-02-26T23:59:59').getTime();
const MS_PER_DAY = 1000 * 60 * 60 * 24;

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: CategoryStat;
  }>;
}

const CategoryBarTooltip: React.FC<CustomBarTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) {
    return null;
  }
  const item = payload[0].payload;
  const pct = item.total > 0 ? Math.round((item.completados / item.total) * 100) : 0;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-gray-100">{item.name}</div>
      <div className="mt-1.5 space-y-1 font-mono tabular-nums">
        <div className="flex items-center justify-between gap-4 text-amber-400">
          <span>Completados:</span>
          <span>{item.completados}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-gray-400">
          <span>Pendientes:</span>
          <span>{item.pendientes}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-gray-800 pt-1 text-gray-200">
          <span>Avance:</span>
          <span>
            {item.completados}/{item.total} ({pct}%)
          </span>
        </div>
      </div>
    </div>
  );
};

interface CustomGenTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: GenerationStat;
  }>;
}

const GenerationBarTooltip: React.FC<CustomGenTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) {
    return null;
  }
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-gray-100">
        {item.gen} · {item.region}
      </div>
      <div className="mt-1.5 space-y-1 font-mono tabular-nums">
        <div className="flex items-center justify-between gap-4 text-amber-400">
          <span>Porcentaje completado:</span>
          <span>{item.porcentaje}%</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-gray-300">
          <span>Tareas rescatadas:</span>
          <span>
            {item.completados} / {item.total}
          </span>
        </div>
      </div>
    </div>
  );
};

interface TimeSlice {
  name: string;
  value: number;
  fill: string;
}

interface CustomTimeTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
  }>;
  totalDays: number;
}

const TimePieTooltip: React.FC<CustomTimeTooltipProps> = ({ active, payload, totalDays }) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const entry = payload[0];
  const val = typeof entry.value === 'number' ? entry.value : 0;
  const pct = totalDays > 0 ? Math.round((val / totalDays) * 100) : 0;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-gray-100">{entry.name}</div>
      <div className="mt-1 font-mono tabular-nums text-amber-400">
        {val} días ({pct}%)
      </div>
    </div>
  );
};

export const RescueStatsPanel: React.FC<RescueStatsPanelProps> = ({
  categories,
  generations,
  onSelectCategory,
}) => {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [chartView, setChartView] = useState<StatsChartView>('category');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const totals = useMemo(() => {
    const total = categories.reduce((acc, c) => acc + c.total, 0);
    const completed = categories.reduce((acc, c) => acc + c.completados, 0);
    const pending = Math.max(0, total - completed);
    return { total, completed, pending };
  }, [categories]);

  const timeMetrics = useMemo(() => {
    const totalWindowDays = Math.max(
      1,
      Math.round((SHUTDOWN_TARGET_MS - WINDOW_START_MS) / MS_PER_DAY)
    );
    const remainingMs = Math.max(0, SHUTDOWN_TARGET_MS - nowMs);
    const daysRemaining = Math.ceil(remainingMs / MS_PER_DAY);
    const clampedRemaining = Math.min(totalWindowDays, daysRemaining);
    const daysElapsed = Math.max(0, totalWindowDays - clampedRemaining);
    const weeksRemaining = remainingMs / (MS_PER_DAY * 7);
    const pacePerWeek =
      totals.pending === 0
        ? '0.0'
        : weeksRemaining > 0.14
        ? (totals.pending / weeksRemaining).toFixed(1)
        : String(totals.pending);
    const isUrgent = daysRemaining < 100;
    const remainingPct = Math.round((clampedRemaining / totalWindowDays) * 100);

    const slices: TimeSlice[] = [
      {
        name: 'Días restantes',
        value: clampedRemaining,
        fill: isUrgent ? '#EF4444' : '#F59E0B',
      },
      {
        name: 'Días transcurridos (último año)',
        value: daysElapsed,
        fill: '#1F2937',
      },
    ];

    return {
      totalWindowDays,
      daysRemaining,
      daysElapsed,
      pacePerWeek,
      isUrgent,
      remainingPct,
      slices,
    };
  }, [nowMs, totals.pending]);

  return (
    <div className="mt-5 border-t border-gray-800 pt-5">
      {/* Unboxed tabular KPI row */}
      <div className="grid grid-cols-2 gap-4 border-b border-gray-800 pb-5 sm:grid-cols-4">
        <div>
          <div className="text-xs text-gray-400">Rescatados</div>
          <div className="mt-1 font-mono text-xl font-bold tabular-nums text-amber-400">
            {totals.completed}
            <span className="text-sm font-normal text-gray-500"> / {totals.total}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Por rescatar</div>
          <div className="mt-1 font-mono text-xl font-bold tabular-nums text-gray-100">
            {totals.pending}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Tiempo restante</div>
          <div
            className={`mt-1 font-mono text-xl font-bold tabular-nums ${
              timeMetrics.isUrgent ? 'text-red-400' : 'text-amber-400'
            }`}
          >
            {timeMetrics.daysRemaining} días
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Ritmo sugerido</div>
          <div className="mt-1 font-mono text-xl font-bold tabular-nums text-gray-100">
            {timeMetrics.pacePerWeek}
            <span className="text-xs font-normal text-gray-400"> obj/sem</span>
          </div>
        </div>
      </div>

      {/* 2-column Recharts analytics grid */}
      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
        {/* Left: Switchable Category vs Generation Stats Chart */}
        <div className="lg:col-span-7">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-gray-200">
                {chartView === 'category'
                  ? 'Progreso por categoría'
                  : 'Estadísticas por Generación'}
              </h2>
              <p className="text-xs text-gray-500">
                {chartView === 'category'
                  ? 'Completados vs. pendientes'
                  : 'Porcentaje de tareas completadas por generación'}
              </p>
            </div>

            <div
              role="group"
              aria-label="Tipo de gráfico estadístico"
              className="inline-flex rounded-lg border border-gray-800 bg-gray-950 p-1"
            >
              <button
                type="button"
                onClick={() => setChartView('category')}
                className={`min-h-[32px] rounded-md px-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  chartView === 'category'
                    ? 'bg-gray-800 text-amber-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Por Categoría
              </button>
              <button
                type="button"
                onClick={() => setChartView('generation')}
                className={`min-h-[32px] rounded-md px-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  chartView === 'generation'
                    ? 'bg-gray-800 text-amber-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Por Generación
              </button>
            </div>
          </div>

          {chartView === 'category' ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categories}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                  barCategoryGap="26%"
                >
                  <CartesianGrid stroke="#1F2937" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: '#9CA3AF', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                    axisLine={{ stroke: '#374151' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={106}
                    tick={{ fill: '#E5E7EB', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(245, 158, 11, 0.06)' }}
                    content={<CategoryBarTooltip />}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }}
                    formatter={(value: string) => (
                      <span className="text-gray-300">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="completados"
                    name="Completados"
                    stackId="progress"
                    fill="#F59E0B"
                    radius={[0, 0, 0, 0]}
                    className={onSelectCategory ? 'cursor-pointer' : undefined}
                    onClick={(barData) => {
                      const key = (barData as unknown as { payload?: CategoryStat })?.payload?.key;
                      if (key && onSelectCategory) onSelectCategory(key);
                    }}
                  />
                  <Bar
                    dataKey="pendientes"
                    name="Pendientes"
                    stackId="progress"
                    fill="#374151"
                    radius={[0, 4, 4, 0]}
                    className={onSelectCategory ? 'cursor-pointer' : undefined}
                    onClick={(barData) => {
                      const key = (barData as unknown as { payload?: CategoryStat })?.payload?.key;
                      if (key && onSelectCategory) onSelectCategory(key);
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={generations}
                    margin={{ top: 8, right: 12, left: -12, bottom: 4 }}
                    barCategoryGap="24%"
                  >
                    <CartesianGrid stroke="#1F2937" vertical={false} />
                    <XAxis
                      dataKey="gen"
                      tick={{ fill: '#E5E7EB', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(val: number) => `${val}%`}
                      tick={{
                        fill: '#9CA3AF',
                        fontSize: 11,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(245, 158, 11, 0.06)' }}
                      content={<GenerationBarTooltip />}
                    />
                    <Bar
                      dataKey="porcentaje"
                      name="% Completado"
                      fill="#F59E0B"
                      background={{ fill: '#1F2937', radius: 6 }}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-x-4 gap-y-1.5 border-t border-gray-800/80 pt-2.5 sm:grid-cols-6">
                {generations.map((g) => (
                  <div key={g.gen} className="text-center">
                    <div className="text-[11px] font-medium text-gray-400">{g.gen}</div>
                    <div className="font-mono text-xs font-semibold tabular-nums text-amber-400">
                      {g.porcentaje}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Remaining Time Donut Chart */}
        <div className="border-t border-gray-800 pt-5 lg:col-span-5 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-gray-200">
              Ventana hacia el cierre
            </h2>
            <span className="font-mono text-xs tabular-nums text-gray-400">
              26 Feb 2027
            </span>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
            <div className="relative h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeMetrics.slices}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={74}
                    startAngle={90}
                    endAngle={-270}
                    stroke="#111827"
                    strokeWidth={2}
                  />
                  <Tooltip
                    content={<TimePieTooltip totalDays={timeMetrics.totalWindowDays} />}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Central tabular readout */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span
                  className={`font-mono text-2xl font-bold tabular-nums leading-none ${
                    timeMetrics.isUrgent ? 'text-red-400' : 'text-amber-400'
                  }`}
                >
                  {timeMetrics.daysRemaining}
                </span>
                <span className="mt-1 text-[11px] font-medium text-gray-400">
                  días libres
                </span>
              </div>
            </div>

            <div className="w-full space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-3 border-b border-gray-800 pb-2">
                <span className="text-gray-400">Ventana restante</span>
                <span
                  className={`font-mono font-semibold tabular-nums ${
                    timeMetrics.isUrgent ? 'text-red-400' : 'text-amber-400'
                  }`}
                >
                  {timeMetrics.remainingPct}% del año final
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-gray-800 pb-2">
                <span className="text-gray-400">Días transcurridos</span>
                <span className="font-mono font-semibold tabular-nums text-gray-200">
                  {timeMetrics.daysElapsed} días
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-400">Estado de alerta</span>
                <span
                  className={`font-semibold ${
                    timeMetrics.isUrgent ? 'text-red-400' : 'text-amber-400'
                  }`}
                >
                  {timeMetrics.isUrgent ? 'Crítico (< 100 días)' : 'En ventana activa'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

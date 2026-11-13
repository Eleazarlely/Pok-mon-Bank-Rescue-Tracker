import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BarChart3,
  ChevronDown,
  ChevronUp,
  History,
  Maximize2,
  Minimize2,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { CountdownClock } from './components/CountdownClock';
import { HistoryActionType, HistoryLogEntry, HistoryModal } from './components/HistoryModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  CategoryStat,
  GenerationStat,
  RescueStatsPanel,
} from './components/RescueStatsPanel';
import { RibbonRoadmap } from './components/RibbonRoadmap';
import { TrackerCard } from './components/TrackerCard';
import { database } from './data/database';

type TabKey = 'singulares' | 'cintas' | 'legendarios' | 'exclusivos';
type CompletionFilter = 'all' | 'pending' | 'completed';

const STORAGE_KEY = 'pokemon_bank_rescue_completed_ids';
const NOTES_STORAGE_KEY = 'pokemon_bank_rescue_notes';
const HISTORY_STORAGE_KEY = 'pokemon_bank_rescue_history_log';
const MAX_HISTORY_ENTRIES = 100;

function loadCompletedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

function loadNotes(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const cleaned: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === 'string' && v.trim().length > 0) {
          cleaned[k] = v;
        }
      }
      return cleaned;
    }
    return {};
  } catch {
    return {};
  }
}

function loadHistory(): HistoryLogEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is HistoryLogEntry =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as HistoryLogEntry).id === 'string' &&
          typeof (item as HistoryLogEntry).timestamp === 'string' &&
          typeof (item as HistoryLogEntry).itemTitle === 'string'
      );
    }
    return [];
  } catch {
    return [];
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('singulares');
  const [completedArray, setCompletedArray] = useState<string[]>(() => loadCompletedIds());
  const [notes, setNotes] = useState<Record<string, string>>(() => loadNotes());
  const [historyLog, setHistoryLog] = useState<HistoryLogEntry[]>(() => loadHistory());
  const [hideShinyLocked, setHideShinyLocked] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all');
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(true);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedArray));
    } catch {
      // Ignore storage quota / private mode errors gracefully
    }
  }, [completedArray]);

  useEffect(() => {
    try {
      window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Ignore storage quota / private mode errors gracefully
    }
  }, [notes]);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyLog));
    } catch {
      // Ignore storage quota / private mode errors gracefully
    }
  }, [historyLog]);

  const itemLookup = useMemo(() => {
    const map = new Map<string, { title: string; categoryLabel: string }>();
    for (const s of database.singulares) {
      map.set(s.id, { title: s.pokemon, categoryLabel: 'Singulares' });
    }
    for (const c of database.cintas) {
      map.set(c.id, { title: c.nombre, categoryLabel: `Ribbon Master (${c.generacion})` });
    }
    for (const l of database.legendarios) {
      map.set(l.id, { title: l.pokemonDisponible, categoryLabel: `Legendarios (${l.generacion})` });
    }
    for (const e of database.exclusivos) {
      map.set(e.id, { title: e.especieObjeto, categoryLabel: 'Casos Críticos' });
    }
    return map;
  }, []);

  const appendHistory = (
    itemId: string,
    action: HistoryActionType,
    detail?: string,
    overrideMeta?: { title: string; categoryLabel: string }
  ) => {
    const meta = overrideMeta ?? itemLookup.get(itemId) ?? {
      title: itemId,
      categoryLabel: 'Registro',
    };
    const now = new Date().toISOString();
    const newEntry: HistoryLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      itemId,
      itemTitle: meta.title,
      categoryLabel: meta.categoryLabel,
      action,
      detail,
      timestamp: now,
    };
    setHistoryLog((prev) => [newEntry, ...prev].slice(0, MAX_HISTORY_ENTRIES));
  };

  const completedSet = useMemo(() => new Set(completedArray), [completedArray]);

  const toggleItem = (id: string) => {
    const wasCompleted = completedSet.has(id);
    setCompletedArray((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
    );
    appendHistory(id, wasCompleted ? 'uncompleted' : 'completed');
  };

  const saveNote = (id: string, text: string) => {
    const trimmed = text.trim();
    const hadPrevious = Boolean(notes[id]);
    setNotes((prev) => {
      const next = { ...prev };
      if (trimmed.length === 0) {
        delete next[id];
      } else {
        next[id] = trimmed;
      }
      return next;
    });

    if (trimmed.length === 0) {
      if (hadPrevious) {
        appendHistory(id, 'note_deleted');
      }
    } else {
      const preview = trimmed.length > 90 ? `${trimmed.slice(0, 90)}…` : trimmed;
      appendHistory(id, hadPrevious ? 'note_updated' : 'note_added', preview);
    }
  };

  const handleResetProgress = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setCompletedArray([]);
    setConfirmReset(false);
    appendHistory('system-reset', 'reset_progress', undefined, {
      title: 'Todos los objetivos desmarcados',
      categoryLabel: 'Sistema',
    });
  };

  const totalItemsCount =
    database.singulares.length +
    database.cintas.length +
    database.legendarios.length +
    database.exclusivos.length;

  const totalCompletedCount = useMemo(() => {
    const allIds = new Set([
      ...database.singulares.map((s) => s.id),
      ...database.cintas.map((c) => c.id),
      ...database.legendarios.map((l) => l.id),
      ...database.exclusivos.map((e) => e.id),
    ]);
    return completedArray.filter((id) => allIds.has(id)).length;
  }, [completedArray]);

  const globalProgressPct =
    totalItemsCount > 0 ? Math.round((totalCompletedCount / totalItemsCount) * 100) : 0;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchesCompletion = (id: string) => {
    const done = completedSet.has(id);
    if (completionFilter === 'pending') return !done;
    if (completionFilter === 'completed') return done;
    return true;
  };

  const filteredSingulares = useMemo(() => {
    return database.singulares.filter((item) => {
      if (hideShinyLocked && item.shinyStatus === 'Bloqueado') return false;
      if (!matchesCompletion(item.id)) return false;
      if (!normalizedQuery) return true;
      const noteText = (notes[item.id] ?? '').toLowerCase();
      return (
        item.pokemon.toLowerCase().includes(normalizedQuery) ||
        item.juegoOptimo.toLowerCase().includes(normalizedQuery) ||
        item.metodoRequerido.toLowerCase().includes(normalizedQuery) ||
        item.restriccionesActivacion.toLowerCase().includes(normalizedQuery) ||
        noteText.includes(normalizedQuery)
      );
    });
  }, [hideShinyLocked, completionFilter, normalizedQuery, completedSet, notes]);

  const filteredCintas = useMemo(() => {
    return database.cintas.filter((item) => {
      if (!matchesCompletion(item.id)) return false;
      if (!normalizedQuery) return true;
      const noteText = (notes[item.id] ?? '').toLowerCase();
      return (
        item.nombre.toLowerCase().includes(normalizedQuery) ||
        item.generacion.toLowerCase().includes(normalizedQuery) ||
        item.juegoObtencion.toLowerCase().includes(normalizedQuery) ||
        item.metodo.toLowerCase().includes(normalizedQuery) ||
        item.tituloOtorgado.toLowerCase().includes(normalizedQuery) ||
        noteText.includes(normalizedQuery)
      );
    });
  }, [completionFilter, normalizedQuery, completedSet, notes]);

  const filteredLegendarios = useMemo(() => {
    return database.legendarios.filter((item) => {
      if (hideShinyLocked && item.shinyStatus === 'Bloqueado') return false;
      if (!matchesCompletion(item.id)) return false;
      if (!normalizedQuery) return true;
      const noteText = (notes[item.id] ?? '').toLowerCase();
      return (
        item.pokemonDisponible.toLowerCase().includes(normalizedQuery) ||
        item.generacion.toLowerCase().includes(normalizedQuery) ||
        item.juego.toLowerCase().includes(normalizedQuery) ||
        item.metodoObservaciones.toLowerCase().includes(normalizedQuery) ||
        noteText.includes(normalizedQuery)
      );
    });
  }, [hideShinyLocked, completionFilter, normalizedQuery, completedSet, notes]);

  const filteredExclusivos = useMemo(() => {
    return database.exclusivos.filter((item) => {
      if (!matchesCompletion(item.id)) return false;
      if (!normalizedQuery) return true;
      const noteText = (notes[item.id] ?? '').toLowerCase();
      return (
        item.especieObjeto.toLowerCase().includes(normalizedQuery) ||
        item.categoria.toLowerCase().includes(normalizedQuery) ||
        item.metodoLegalidad.toLowerCase().includes(normalizedQuery) ||
        item.estadoHome.toLowerCase().includes(normalizedQuery) ||
        noteText.includes(normalizedQuery)
      );
    });
  }, [completionFilter, normalizedQuery, completedSet, notes]);

  const hiddenLockedSingularesCount = database.singulares.filter(
    (s) => s.shinyStatus === 'Bloqueado'
  ).length;
  const hiddenLockedLegendariosCount = database.legendarios.filter(
    (l) => l.shinyStatus === 'Bloqueado'
  ).length;

  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    done: number;
    total: number;
  }> = [
    {
      key: 'singulares',
      label: 'Singulares',
      icon: <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />,
      done: database.singulares.filter((i) => completedSet.has(i.id)).length,
      total: database.singulares.length,
    },
    {
      key: 'cintas',
      label: 'Ribbon Master',
      icon: <Award className="h-4 w-4 shrink-0" aria-hidden="true" />,
      done: database.cintas.filter((i) => completedSet.has(i.id)).length,
      total: database.cintas.length,
    },
    {
      key: 'legendarios',
      label: 'Legendarios',
      icon: <Shield className="h-4 w-4 shrink-0" aria-hidden="true" />,
      done: database.legendarios.filter((i) => completedSet.has(i.id)).length,
      total: database.legendarios.length,
    },
    {
      key: 'exclusivos',
      label: 'Casos Críticos',
      icon: <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />,
      done: database.exclusivos.filter((i) => completedSet.has(i.id)).length,
      total: database.exclusivos.length,
    },
  ];

  const categoryStats: CategoryStat[] = useMemo(
    () =>
      tabs.map((tab) => ({
        key: tab.key,
        name: tab.label,
        completados: tab.done,
        pendientes: Math.max(0, tab.total - tab.done),
        total: tab.total,
      })),
    [completedSet]
  );

  const generationStats: GenerationStat[] = useMemo(() => {
    const genOrder: Array<{ gen: string; region: string }> = [
      { gen: 'Gen 2', region: 'Johto (VC 3DS)' },
      { gen: 'Gen 3', region: 'Hoenn / Orre' },
      { gen: 'Gen 4', region: 'Sinnoh / Johto' },
      { gen: 'Gen 5', region: 'Teselia' },
      { gen: 'Gen 6', region: 'Kalos / ORAS' },
      { gen: 'Gen 7', region: 'Alola / Bank' },
    ];

    const singularGenMap: Record<string, string> = {
      'sing-mew': 'Gen 3',
      'sing-celebi': 'Gen 2',
      'sing-jirachi': 'Gen 3',
      'sing-deoxys': 'Gen 3',
      'sing-arceus-platino': 'Gen 4',
      'sing-victini': 'Gen 5',
    };

    const exclusivoGenMap: Record<string, string> = {
      'exc-pichu-picoreja': 'Gen 4',
      'exc-pikachu-coqueta': 'Gen 6',
      'exc-spinda-glitcheado': 'Gen 7',
      'exc-ash-greninja': 'Gen 7',
      'exc-vivillon-eventos': 'Gen 6',
    };

    const allTasks: Array<{ id: string; gen: string }> = [
      ...database.singulares.map((s) => ({ id: s.id, gen: singularGenMap[s.id] ?? 'Gen 3' })),
      ...database.cintas.map((c) => ({ id: c.id, gen: c.generacion })),
      ...database.legendarios.map((l) => ({ id: l.id, gen: l.generacion })),
      ...database.exclusivos.map((e) => ({ id: e.id, gen: exclusivoGenMap[e.id] ?? 'Gen 6' })),
    ];

    return genOrder.map(({ gen, region }) => {
      const items = allTasks.filter((t) => t.gen === gen);
      const total = items.length;
      const completados = items.filter((t) => completedSet.has(t.id)).length;
      const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;
      return { gen, region, completados, total, porcentaje };
    });
  }, [completedSet]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setCompletionFilter('all');
    setHideShinyLocked(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Fixed/Sticky Top Navbar (collapsed in Modo Enfoque) */}
      {!focusMode && (
        <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/95 backdrop-blur-md">
          <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 lg:px-8">
            <a
              href="#top"
              className="flex min-w-0 items-center gap-2.5 sm:gap-3 font-display text-sm sm:text-lg font-bold tracking-tight text-amber-400 whitespace-nowrap"
            >
              <BrandLogo size="md" />
              <span className="truncate">Pokémon Bank Rescue Tracker</span>
            </a>

            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
              <CountdownClock />
              <PWAInstallButton />
            </div>
          </div>
        </header>
      )}

      <main id="top" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Overview & Global Rescue Progress (collapsed in Modo Enfoque) */}
        {!focusMode && (
          <section
            aria-label="Resumen de rescate"
            className="rounded-xl border border-gray-800 bg-gray-900 p-5 sm:p-6"
          >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-100">
                Operación Rescate · Shiny Hunters &amp; Ribbon Masters
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                Registra tus capturas, cintas generacionales y casos de cuarentena antes del apagado
                definitivo de Pokémon Bank el 26 de febrero de 2027. Tu progreso se guarda
                automáticamente en este dispositivo.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4 md:flex-col md:items-end shrink-0">
              <div className="text-left md:text-right">
                <div className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-amber-400">
                  {totalCompletedCount} / {totalItemsCount}
                </div>
                <div className="text-xs text-gray-400">
                  objetivos completados ({globalProgressPct}%)
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowStats((prev) => !prev)}
                  aria-expanded={showStats}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:border-amber-500/50 hover:bg-gray-800 whitespace-nowrap"
                >
                  <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{showStats ? 'Ocultar gráficos' : 'Ver gráficos'}</span>
                  {showStats ? (
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:border-amber-500/50 hover:text-amber-300 whitespace-nowrap"
                >
                  <History className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                  <span>Historial</span>
                  {historyLog.length > 0 && (
                    <span className="font-mono text-xs tabular-nums text-gray-400">
                      ({historyLog.length})
                    </span>
                  )}
                </button>

                {totalCompletedCount > 0 && (
                  <>
                    {confirmReset ? (
                      <>
                        <button
                          type="button"
                          onClick={handleResetProgress}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-500"
                        >
                          Confirmar reinicio
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="inline-flex min-h-[36px] items-center rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResetProgress}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-950 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-gray-700 hover:text-gray-200"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Reiniciar progreso</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-gray-950">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-300"
              style={{ width: `${globalProgressPct}%` }}
            />
          </div>

          {showStats && (
            <RescueStatsPanel
              categories={categoryStats}
              generations={generationStats}
              onSelectCategory={(key) => setActiveTab(key)}
            />
          )}
        </section>
        )}

        {/* Tab Navigation */}
        <nav
          aria-label="Categorías de rescate"
          className={`${focusMode ? '' : 'mt-6'} grid grid-cols-2 gap-2 sm:grid-cols-4`}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[48px] items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                  isActive
                    ? 'border-amber-400 bg-amber-500/10 text-amber-400'
                    : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700 hover:text-gray-100'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </span>
                <span
                  className={`font-mono text-xs tabular-nums shrink-0 ${
                    isActive ? 'text-amber-300' : 'text-gray-500'
                  }`}
                >
                  {tab.done}/{tab.total}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Filter & Shiny-Lock Toolbar */}
        <section
          aria-label="Filtros y búsqueda"
          className="mt-5 flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Pokémon, juego, cinta o método..."
              aria-label="Buscar registros"
              className="h-11 w-full rounded-lg border border-gray-800 bg-gray-950 pl-10 pr-9 text-sm text-gray-100 placeholder:text-gray-500 focus:border-amber-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Completion status segmented filter */}
            <div
              role="group"
              aria-label="Filtrar por estado de progreso"
              className="inline-flex rounded-lg border border-gray-800 bg-gray-950 p-1"
            >
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'pending', label: 'Pendientes' },
                  { id: 'completed', label: 'Completados' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCompletionFilter(opt.id)}
                  className={`min-h-[36px] rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors ${
                    completionFilter === opt.id
                      ? 'bg-gray-800 text-amber-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Crucial Shiny-Lock Switch in Singulares & Legendarios */}
            {(activeTab === 'singulares' || activeTab === 'legendarios') && (
              <button
                type="button"
                role="switch"
                aria-checked={hideShinyLocked}
                onClick={() => setHideShinyLocked((prev) => !prev)}
                className={`inline-flex min-h-[44px] items-center gap-3 rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                  hideShinyLocked
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                    : 'border-gray-700 bg-gray-950 text-gray-200 hover:border-gray-600'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    hideShinyLocked ? 'bg-amber-400' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-gray-950 transition-transform ${
                      hideShinyLocked ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </span>
                <span>Ocultar Shiny-Locked</span>
                <span className="font-mono text-xs text-gray-400 tabular-nums">
                  (
                  {activeTab === 'singulares'
                    ? hiddenLockedSingularesCount
                    : hiddenLockedLegendariosCount}
                  )
                </span>
              </button>
            )}

            {/* Focus Mode Toggle Button */}
            <button
              type="button"
              aria-pressed={focusMode}
              onClick={() => setFocusMode((prev) => !prev)}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                focusMode
                  ? 'border-amber-400 bg-amber-500 text-gray-950 hover:bg-amber-400'
                  : 'border-gray-700 bg-gray-950 text-gray-200 hover:border-amber-500/40 hover:text-amber-300'
              }`}
            >
              {focusMode ? (
                <>
                  <Minimize2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Salir de Modo Enfoque</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Modo Enfoque</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Active View Content */}
        <section className="mt-6" aria-live="polite">
          {activeTab === 'singulares' && (
            <>
              {filteredSingulares.length === 0 ? (
                <EmptyState onReset={clearAllFilters} />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredSingulares.map((item) => (
                    <TrackerCard
                      key={item.id}
                      item={{ kind: 'singular', data: item }}
                      isCompleted={completedSet.has(item.id)}
                      note={notes[item.id] ?? ''}
                      onToggle={toggleItem}
                      onSaveNote={saveNote}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'cintas' && (
            <RibbonRoadmap
              cintas={filteredCintas}
              completedIds={completedSet}
              notes={notes}
              onToggle={toggleItem}
              onSaveNote={saveNote}
            />
          )}

          {activeTab === 'legendarios' && (
            <>
              {filteredLegendarios.length === 0 ? (
                <EmptyState onReset={clearAllFilters} />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredLegendarios.map((item) => (
                    <TrackerCard
                      key={item.id}
                      item={{ kind: 'legendario', data: item }}
                      isCompleted={completedSet.has(item.id)}
                      note={notes[item.id] ?? ''}
                      onToggle={toggleItem}
                      onSaveNote={saveNote}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'exclusivos' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-red-500/40 bg-red-950/25 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="text-xl leading-none" aria-hidden="true">
                    ⚠️
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-red-400">
                      Zona de Cuarentena · Especies y Formas Bloqueadas
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-gray-300">
                      Las tarjetas señaladas con borde rojo pulsante indican Pokémon que{' '}
                      <strong className="text-white">
                        Pokémon Bank o Pokémon HOME rechazan permanentemente
                      </strong>{' '}
                      (como Pichu Picoreja, Pikachu Coqueta o el error de patrón de Spinda).
                      Planifica su resguardo local en cartucho o consola 3DS.
                    </p>
                  </div>
                </div>
              </div>

              {filteredExclusivos.length === 0 ? (
                <EmptyState onReset={clearAllFilters} />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredExclusivos.map((item) => (
                    <TrackerCard
                      key={item.id}
                      item={{ kind: 'exclusivo', data: item }}
                      isCompleted={completedSet.has(item.id)}
                      note={notes[item.id] ?? ''}
                      onToggle={toggleItem}
                      onSaveNote={saveNote}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <HistoryModal
        isOpen={showHistoryModal}
        entries={historyLog}
        onClose={() => setShowHistoryModal(false)}
        onClearHistory={() => setHistoryLog([])}
      />

      <OfflineIndicator />
    </div>
  );
}

const EmptyState: React.FC<{ onReset: () => void }> = ({ onReset }) => (
  <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center">
    <p className="text-sm text-gray-400">
      No se encontraron registros con los filtros aplicados.
    </p>
    <button
      type="button"
      onClick={onReset}
      className="mt-4 inline-flex min-h-[40px] items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-gray-950 transition-colors hover:bg-amber-400"
    >
      Restablecer filtros
    </button>
  </div>
);

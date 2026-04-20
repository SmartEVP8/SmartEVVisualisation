import { Battery, BatteryCharging, CheckCircle2, ChevronLeft, ChevronRight, Crosshair, Plug, Road, X, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { TargetChargeDisplay } from './TargetChargeDisplay';
import {
  selectedStationAtom,
  isSidebarCollapsedAtom,
  clearSelectionAction,
  isShowingRoutesAtom,
  selectedChargerIdAtom
} from '@/store/uiStore';
import { chargersConfigAtom, evsOnRouteAtom, getChargerStatesAtom, type ChargerConfig, type ChargerState, type EVInQueue, type Position } from '@/store/simulationStore';

type StationSidebarProps = {
  onShowIncomingRoutes: (points: Position[]) => void;
  onFocusStation: (lat: number, lon: number) => void;
};

export function StationSidebar({
  onShowIncomingRoutes,
  onFocusStation,
}: StationSidebarProps) {
  const [selectedChargerId, setSelectedChargerId] = useAtom(selectedChargerIdAtom);
  const [isCollapsed, setIsCollapsed] = useAtom(isSidebarCollapsedAtom);

  const setIsShowingRoutes = useSetAtom(isShowingRoutesAtom);
  const clearSelection = useSetAtom(clearSelectionAction);

  const selectedStation = useAtomValue(selectedStationAtom);
  const chargersConfig = useAtomValue(chargersConfigAtom);
  const selectedStationId = selectedStation?.station.id ?? -1;
  const chargerStates = useAtomValue(
    useMemo(() => getChargerStatesAtom(selectedStationId), [selectedStationId])
  );
  const evsOnRoute = useAtomValue(evsOnRouteAtom);

  const stationChargers = useMemo(() => {
    if (!selectedStation) return [];
    return Object.values(chargersConfig).filter(
      (charger) => charger.stationId === selectedStation.station.id
    );
  }, [chargersConfig, selectedStation]);

  if (!selectedStation) return null;
  const station = selectedStation.station;

  const sidebarWidthClass = selectedChargerId === null ? 'w-[26rem]' : 'w-[40rem]';

  const handleClose = () => {
    setSelectedChargerId(null);
    clearSelection();
  };

  const toggleChargerSelection = (chargerId: number) =>
    setSelectedChargerId((current) => (current === chargerId ? null : chargerId));

  const handleFocus = () => onFocusStation(station.pos.lat, station.pos.lon);

  const handleShowRoutes = () => {
    setIsShowingRoutes(true);
    const routes = evsOnRoute[station.id] || [];
    const points = routes.flatMap(r => r.waypoints);
    onShowIncomingRoutes(points);
  };

  const selectedChargerState = selectedChargerId !== null ? (chargerStates[selectedChargerId] ?? null) : null;
  const selectedQueueItems = selectedChargerState?.queue ?? [];
  const selectedChargingEVs = selectedChargerState?.chargingEVs ?? [];

  return (
    <Card
      className={`
        absolute top-6 right-6 bottom-6 z-[400]
        flex ${sidebarWidthClass} flex-col overflow-hidden
        transition-all duration-200
        ${isCollapsed ? 'translate-x-[calc(100%-4.25rem)] opacity-100' : 'translate-x-0 opacity-100'}
      `}
    >
      <StationSidebarHeader
        title={station.address}
        isCollapsed={isCollapsed}
        onToggleCollapsed={() => setIsCollapsed(!isCollapsed)}
        onFocusStation={handleFocus}
        onShowIncomingRoutes={handleShowRoutes}
        onClose={handleClose}
      />

      <StationStats
        chargers={stationChargers}
        chargerStates={chargerStates}
      />

      <div
        className={`flex flex-1 flex-col gap-4 overflow-hidden p-5 transition-opacity duration-200 ${isCollapsed ? 'pointer-events-none opacity-20' : 'opacity-100'}`}>
        <div className="flex flex-1 gap-4 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Chargers
            </p>
            <p className="mb-3 text-xs text-muted-foreground/80">
              Click a charger card to view queue details.
            </p>
            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto">
              {stationChargers.map((charger) => {
                const chargerState = chargerStates[charger.id] ?? null;

                return (
                  <ChargerCard
                    key={charger.id}
                    charger={charger}
                    chargerState={chargerState}
                    isSelected={selectedChargerId === charger.id}
                    onSelect={toggleChargerSelection}
                  />
                );
              })}
            </div>
          </div>
          <Separator orientation="vertical" className="bg-border/30" />
          {selectedChargerId !== null && (
            <ChargerDetailSection
              chargingEVs={selectedChargingEVs}
              queueItems={selectedQueueItems}
              onClear={() => setSelectedChargerId(null)}
            />
          )}
        </div>
      </div>
    </Card>
  );
}

// --- Subcomponents ---

type StationSidebarHeaderProps = {
  title: string;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onFocusStation: () => void;
  onShowIncomingRoutes: () => void;
  onClose: () => void;
};

function StationSidebarHeader({
  title,
  isCollapsed,
  onToggleCollapsed,
  onFocusStation,
  onShowIncomingRoutes,
  onClose,
}: StationSidebarHeaderProps) {
  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-4 p-6 pb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={onToggleCollapsed}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="-mt-1 h-10 w-10 shrink-0 rounded-full"
            >
              {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</TooltipContent>
        </Tooltip>

        <h2 className="col-span-2 row-start-2 min-w-0 truncate text-2xl leading-tight font-semibold">{title}</h2>

        <ButtonGroup className="col-start-2 row-start-1 justify-self-end shrink-0 [&>[data-slot=button]:h-10 [&>[data-slot=button]:w-10 [&>[data-slot=button]:rounded-full]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={onFocusStation}
                className="h-10 w-10 rounded-full"
                aria-label="Focus selected station"
              >
                <Crosshair className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Focus station</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="default"
                onClick={onShowIncomingRoutes}
                className="h-10 w-10 rounded-full"
                aria-label="Show incoming EVs"
              >
                <Road className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show incoming EVs</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onClose}
                type="button"
                size="icon"
                variant="outline"
                className="h-10 w-10 rounded-full"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Close sidebar</TooltipContent>
          </Tooltip>
        </ButtonGroup>
      </div>
      <Separator />
    </>
  );
}

type ChargerCardProps = {
  charger: ChargerConfig;
  chargerState: ChargerState | null;
  isSelected: boolean;
  onSelect: (chargerId: number) => void;
};

function ChargerCard({ charger, chargerState, isSelected, onSelect }: ChargerCardProps) {
  const chargingEVs = chargerState?.chargingEVs ?? [];

  const cardClass = [
    "relative cursor-pointer p-4 text-left transition-all duration-200",
    !isSelected && "hover:bg-muted/50 hover:border-border/70",
  ].filter(Boolean).join(" ");

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(charger.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(charger.id);
        }
      }}
    >
      <Card size="sm" variant="muted" selected={isSelected} className={cardClass}>
        <CardHeader className="px-0 py-0 pb-2 relative z-20">
          <div className="flex items-center justify-between gap-2">
            <h3 className="min-w-0 flex-1 truncate text-sm font-bold">Charger {charger.id}</h3>
            <div className="flex shrink-0 items-center gap-1">
              {charger.isDual ? (
                <Badge variant="default">
                  <Battery className="h-4 w-4" />
                  Dual
                </Badge>
              ) : (
                <Badge variant="default">
                  <Plug className="h-4 w-4" />
                  Single
                </Badge>
              )}
              <Badge variant="secondary">
                {chargerState?.isActive ? <BatteryCharging className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {chargerState?.isActive ? 'Active' : 'Free'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 py-0 relative z-20">
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Energy</span>
              <span className="font-medium">{charger.maxEnergyKWh} kWh</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Queue</span>
              <span className="font-medium">{chargerState?.queue?.length ?? 0}</span>
            </div>

            {/* Charging EVs inline summary */}
            {chargingEVs.length > 0 && (
              <>
                <Separator className="bg-border/40" />
                <div className="space-y-2">
                  {chargingEVs.map((ev) => (
                    <div key={ev.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          Vehicle {ev.id}
                        </span>
                        <span className="text-xs font-medium">
                          {Math.round(ev.soc * 100)}% → {Math.round(ev.targetSoC * 100)}%
                        </span>
                      </div>
                      <TargetChargeDisplay soc={ev.soc} targetSoC={ev.targetSoC} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type EVCardProps = {
  ev: EVInQueue;
  isCharging?: boolean;
};

function EVCard({ ev, isCharging = false }: EVCardProps) {
  return (
    <Card size="sm" variant="muted" className='gap-0'>
      <CardHeader className="px-0 mb-0 py-0 pb-2">
        <div className="flex items-center gap-1.5">
          {isCharging && <Zap className="h-3.5 w-3.5 shrink-0 text-yellow-500" />}
          <p className="text-sm font-bold">Vehicle {ev.id}</p>
        </div>
      </CardHeader>
      <CardContent className="px-0 mt-0 py-0">
        <TargetChargeDisplay soc={ev.soc} targetSoC={ev.targetSoC} />
      </CardContent>
    </Card>
  );
}

type ChargerDetailSectionProps = {
  chargingEVs: EVInQueue[];
  queueItems: EVInQueue[];
  onClear: () => void;
};

function ChargerDetailSection({ chargingEVs, queueItems, onClear }: ChargerDetailSectionProps) {
  return (
    <div className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col gap-4 pl-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Charger Detail
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 px-2 text-xs"
          >
            Clear
          </Button>
        </div>

        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto">
          {/* Currently Charging */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Zap className="h-3 w-3 text-yellow-500" />
              Charging
            </p>
            {chargingEVs.length > 0 ? (
              <div className="space-y-2">
                {chargingEVs.map((ev) => (
                  <EVCard key={ev.id} ev={ev} isCharging />
                ))}
              </div>
            ) : (
              <Card variant="muted" className="p-3">
                <p className="text-xs text-muted-foreground">No vehicles charging</p>
              </Card>
            )}
          </div>

          <Separator className="bg-border/30" />

          {/* Queue */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Queue
            </p>
            {queueItems.length > 0 ? (
              <div className="space-y-2">
                {queueItems.map((ev) => (
                  <EVCard key={ev.id} ev={ev} />
                ))}
              </div>
            ) : (
              <Card variant="muted" className="p-3">
                <p className="text-xs text-muted-foreground">No vehicles waiting</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type StationStatsProps = {
  chargers: ChargerConfig[];
  chargerStates: Record<number, ChargerState>;
};

function StationStats({
  chargers,
  chargerStates,
}: StationStatsProps) {
  const activeCount = chargers.filter((charger) => chargerStates[charger.id]?.isActive).length;
  const queueCount = chargers.reduce((sum, charger) => sum + (chargerStates[charger.id]?.queue?.length ?? 0), 0);
  const dualCount = chargers.filter((charger) => charger.isDual).length;

  return (
    <>
      <div className="px-5 py-4">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-3 text-center text-xs">
          <Card variant="muted" size="xs" className="p-2">
            <p className="text-muted-foreground text-sm font-semibold uppercase">Chargers</p>
            <p className="text-lg font-bold">{chargers.length}</p>
          </Card>
          <Card variant="muted" size="xs" className="p-2">
            <p className="text-muted-foreground text-sm font-semibold uppercase">Active</p>
            <p className="text-lg font-bold">{activeCount}</p>
          </Card>
          <Card variant="muted" size="xs" className="p-2">
            <p className="text-muted-foreground text-sm font-semibold uppercase">Queue</p>
            <p className="text-lg font-bold">{queueCount}</p>
          </Card>
          <Card variant="muted" size="xs" className="p-2">
            <p className="text-muted-foreground text-sm font-semibold uppercase">Dual</p>
            <p className="text-lg font-bold">{dualCount}</p>
          </Card>
        </div>
      </div>
      <Separator />
    </>
  );
}

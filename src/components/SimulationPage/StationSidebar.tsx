import { Battery, ChevronLeft, ChevronRight, Plug, Road } from 'lucide-react';
import { useState } from 'react';
import type { ChargerState } from '../../types/chargerState';
import { fakeEVChargerStates } from '../../types/chargerState';
import type { Charger, Station } from '../../types/station';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type StationSidebarProps = {
  selectedStation: {
    station: Station;
    chargers: Charger[];
  } | null;
  chargerStatesByChargerId: Map<number, ChargerState>;
  onClose: () => void;
  onShowIncomingRoutes: () => void;
};

export function StationSidebar({
  selectedStation,
  chargerStatesByChargerId,
  onClose,
  onShowIncomingRoutes,
}: StationSidebarProps) {
  const isOpen = selectedStation !== null;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedChargerSelection, setSelectedChargerSelection] = useState<{
    stationId: number;
    chargerId: number;
  } | null>(null);

  const selectedChargerId =
    selectedStation && selectedChargerSelection?.stationId === selectedStation.station.id
      ? selectedChargerSelection.chargerId
      : null;

  const sidebarWidthClass = selectedChargerId === null ? 'w-[26rem]' : 'w-[40rem]';

  const handleClose = () => {
    setIsCollapsed(false);
    setSelectedChargerSelection(null);
    onClose();
  };

  const handleSelectCharger = (chargerId: number) => {
    if (!selectedStation) {
      return;
    }

    if (
      selectedChargerSelection?.stationId === selectedStation.station.id &&
      selectedChargerSelection.chargerId === chargerId
    ) {
      setSelectedChargerSelection(null);
      return;
    }

    setSelectedChargerSelection({
      stationId: selectedStation.station.id,
      chargerId,
    });
  };

  // Stats helpers
  const getActiveChargerCount = () => {
    return selectedStation?.chargers.filter(c => chargerStatesByChargerId.get(c.id)?.isActive).length ?? 0;
  };

  const getTotalQueueSize = () => {
    return selectedStation?.chargers.reduce((sum, c) => sum + (chargerStatesByChargerId.get(c.id)?.queueSize ?? 0), 0) ?? 0;
  };

  const getDualChargerCount = () => {
    return selectedStation?.chargers.filter(c => c.isDual).length ?? 0;
  };

  // Render helpers
  const renderChargerCard = (charger: Charger) => {
    const chargerState = chargerStatesByChargerId.get(charger.id) ?? null;
    const isSelected = selectedChargerId === charger.id;

    return (
      <Card
        key={charger.id}
        size="sm"
        onClick={() => handleSelectCharger(charger.id)}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelectCharger(charger.id);
          }
        }}
        className={`cursor-pointer rounded-2xl border text-left transition-all duration-200 p-4 ${
          isSelected
            ? 'border-primary/50 bg-primary/10 shadow-md'
            : 'border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-border/70'
        }`}
      >
        <CardHeader className="px-0 py-0 pb-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold">Charger {charger.id}</h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {chargerState?.isActive ? 'Active' : 'Free'}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-0 py-0">
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Energy</span>
              <span className="font-medium">{charger.maxEnergyKWh} kWh</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Queue</span>
              <span className="font-medium">{chargerState?.queueSize ?? 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type</span>
              <div className="flex items-center gap-1">
                {charger.isDual ? (
                  <>
                    <Battery className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">Dual</span>
                  </>
                ) : (
                  <>
                    <Plug className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-400">Single</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderQueueItem = (ev: ChargerState['evsInQueue'][0]) => (
    <Card
      key={ev.evID}
      size="sm"
      className="rounded-2xl border-border/50 bg-muted/30 p-4"
    >
      <CardHeader className="px-0 py-0 pb-2">
        <p className="text-sm font-bold">Vehicle {ev.evID}</p>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="space-y-3">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Charging Progress</span>
              <span className="text-lg font-bold">{Math.round(ev.SoC * 100)}% → {Math.round(ev.targetSoC * 100)}%</span>
            </div>
            <div className="relative h-4 rounded-full bg-muted overflow-hidden">
              {/* Target SoC background layer */}
              <div
                className="absolute h-full bg-blue-500/30"
                style={{ width: `${ev.targetSoC * 100}%` }}
              />
              {/* Current SoC foreground layer */}
              <div
                className="absolute h-full bg-blue-500"
                style={{ width: `${ev.SoC * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card
      className={`
        absolute top-6 right-6 bottom-6 z-400
        flex ${sidebarWidthClass} max-w-[calc(100vw-3rem)] flex-col overflow-hidden
        rounded-[2.5rem_2.5rem_0_2.5rem]
        border-border/80 bg-card/95 shadow-2xl backdrop-blur-md
        transition-all duration-300
        ${
          isOpen
            ? isCollapsed
              ? 'translate-x-[calc(100%-4.25rem)] opacity-100'
              : 'translate-x-0 opacity-100'
            : 'translate-x-[110%] pointer-events-none opacity-0'
        }
      `}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border/70 p-6 pb-4">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="relative z-30 h-10 w-10 shrink-0 rounded-full"
          >
            {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>

          <h2 className="text-2xl leading-tight font-semibold wrap-break-word">
            {selectedStation?.station.address ?? 'Station'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
       
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
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
       

          <Button
            onClick={handleClose}
            type="button"
            size="icon"
            variant="outline"
            className="h-10 w-10 rounded-full text-xl"
          >
            ×
          </Button>
        </div>
      </div>

      {selectedStation?.chargers.length ? (
        <div className="border-b border-border/50 px-5 py-4">
          <div
            className={`grid gap-2 text-center text-xs ${
              selectedChargerId === null ? 'grid-cols-2' : 'grid-cols-4'
            }`}
          >
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-muted-foreground text-[10px] font-semibold uppercase">Chargers</p>
              <p className="text-base font-bold">{selectedStation.chargers.length}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-muted-foreground text-[10px] font-semibold uppercase">Active</p>
              <p className="text-base font-bold">{getActiveChargerCount()}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-muted-foreground text-[10px] font-semibold uppercase">Queue</p>
              <p className="text-base font-bold">{getTotalQueueSize()}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-muted-foreground text-[10px] font-semibold uppercase">Dual</p>
              <p className="text-base font-bold">{getDualChargerCount()}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={`flex flex-1 flex-col gap-4 overflow-hidden p-5 transition-opacity duration-200 ${
          isCollapsed ? 'pointer-events-none opacity-20' : 'opacity-100'
        }`}
      >
        {selectedStation?.chargers.length ? (
          <div className="flex flex-1 gap-4 overflow-hidden">
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Chargers
              </p>
              <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto">
                {selectedStation.chargers.map(renderChargerCard)}
              </div>
            </div>

            {selectedChargerId !== null && (
              <div className="flex min-w-0 flex-1 flex-col border-l border-border/30 pl-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Queue for Charger {selectedChargerId}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedChargerSelection(null)}
                    className="h-7 px-2 text-xs"
                  >
                    Clear
                  </Button>
                </div>

                {(() => {
                  const selectedChargerState = chargerStatesByChargerId.get(selectedChargerId);
                  const queueItems = selectedChargerState?.evsInQueue && selectedChargerState.evsInQueue.length > 0
                    ? selectedChargerState.evsInQueue
                    : fakeEVChargerStates;

                  return queueItems.length > 0 ? (
                    <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto">
                      {queueItems.map(renderQueueItem)}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-border/50 bg-muted/30 p-4">
                      <p className="text-xs text-muted-foreground">No vehicles waiting</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <Card className="rounded-2xl border-border/50 bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">No chargers found for this station.</p>
          </Card>
        )}
      </div>
    </Card>
  );
}
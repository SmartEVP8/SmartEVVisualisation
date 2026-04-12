import { Battery, BatteryCharging, CheckCircle2, ChevronLeft, ChevronRight, Crosshair, Plug, Road, X } from 'lucide-react';
import { useState } from 'react';
import type { ChargerState } from '../../types/chargerState';
import { fakeEVChargerStates } from '../../types/chargerState';
import type { Charger, Station } from '../../types/station';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ButtonGroup } from '../ui/button-group';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { TargetChargeDisplay } from './TargetChargeDisplay';

type StationSidebarProps = {
  selectedStation: {
    station: Station;
    chargers: Charger[];
  };
  chargerStatesByChargerId: Map<number, ChargerState>;
  onClose: () => void;
  onShowIncomingRoutes: () => void;
  onFocusStation: () => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
};

export function StationSidebar({
  selectedStation,
  chargerStatesByChargerId,
  onClose,
  onShowIncomingRoutes,
  onFocusStation,
  isCollapsed,
  onToggleCollapsed,
}: StationSidebarProps) {
  const [selectedChargerSelection, setSelectedChargerSelection] = useState<{
    stationId: number;
    chargerId: number;
  } | null>(null);

  const selectedChargerId =
    selectedChargerSelection?.stationId === selectedStation.station.id
      ? selectedChargerSelection.chargerId
      : null;

  const sidebarWidthClass = selectedChargerId === null ? 'w-[26rem]' : 'w-[40rem]';

  const handleClose = () => {
    setSelectedChargerSelection(null);
    onClose();
  };

  const toggleChargerSelection = (chargerId: number) => {
    const isSameChargerSelected =
      selectedChargerSelection?.stationId === selectedStation.station.id &&
      selectedChargerSelection.chargerId === chargerId;

    if (isSameChargerSelected) {
      setSelectedChargerSelection(null);
      return;
    }

    setSelectedChargerSelection({
      stationId: selectedStation.station.id,
      chargerId,
    });
  };

  const selectedChargerState = selectedChargerId !== null
    ? chargerStatesByChargerId.get(selectedChargerId)
    : null;

  const selectedQueueItems = selectedChargerState?.evsInQueue && selectedChargerState.evsInQueue.length > 0
    ? selectedChargerState.evsInQueue
    : fakeEVChargerStates;

  return (
    <Card
      className={`
        absolute top-6 right-6 bottom-6 z-400
        flex ${sidebarWidthClass} flex-col overflow-hidden
        transition-all duration-200
        ${isCollapsed ? 'translate-x-[calc(100%-4.25rem)] opacity-100' : 'translate-x-0 opacity-100'}
      `}
    >
      <StationSidebarHeader
        title={selectedStation.station.address}
        isCollapsed={isCollapsed}
        onToggleCollapsed={onToggleCollapsed}
        onFocusStation={onFocusStation}
        onShowIncomingRoutes={onShowIncomingRoutes}
        onClose={handleClose}
      />

      <StationStats
        chargers={selectedStation.chargers}
        chargerStatesByChargerId={chargerStatesByChargerId}
      />

      <div
        className={`flex flex-1 flex-col gap-4 overflow-hidden p-5 transition-opacity duration-200 ${
          isCollapsed ? 'pointer-events-none opacity-20' : 'opacity-100'
        }`}
      >
        <div className="flex flex-1 gap-4 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Chargers
            </p>
            <p className="mb-3 text-xs text-muted-foreground/80">
              Click a charger card to view queue details.
            </p>
            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto">
              {selectedStation.chargers.map((charger) => {
                const chargerState = chargerStatesByChargerId.get(charger.id) ?? null;

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
            <QueueSection
              queueItems={selectedQueueItems}
              onClear={() => setSelectedChargerSelection(null)}
            />
          )}
        </div>
      </div>
    </Card>
  );

}

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
  charger: Charger;
  chargerState: ChargerState | null;
  isSelected: boolean;
  onSelect: (chargerId: number) => void;
};

function ChargerCard({ charger, chargerState, isSelected, onSelect }: ChargerCardProps) {
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
      <Card
        size="sm"
        variant="muted"
        selected={isSelected}
        className={cardClass}
      >
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
              <span className="font-medium">{chargerState?.queueSize ?? 0}</span>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type QueueItemProps = {
  ev: ChargerState['evsInQueue'][0];
};

function QueueItem({ ev }: QueueItemProps) {
  return (
    <Card size="sm" variant="muted" className='gap-0'>
      <CardHeader className="px-0 mb-0 py-0 pb-2">
        <p className="text-sm font-bold">Vehicle {ev.evID}</p>
      </CardHeader>
      <CardContent className="px-0 mt-0 py-0">
        <TargetChargeDisplay soc={ev.SoC} targetSoC={ev.targetSoC} />
      </CardContent>
    </Card>
  );
}

type QueueSectionProps = {
  queueItems: ChargerState['evsInQueue'];
  onClear: () => void;
};

function QueueSection({ queueItems, onClear }: QueueSectionProps) {
  return (
    <div className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col pl-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Queue for Charger
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

        {queueItems.length > 0 ? (
          <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto">
            {queueItems.map((ev) => (
              <QueueItem key={ev.evID} ev={ev} />
            ))}
          </div>
        ) : (
          <Card variant="muted" className="p-4">
            <p className="text-xs text-muted-foreground">No vehicles waiting</p>
          </Card>
        )}
      </div>
    </div>
  );
}

type StationStatsProps = {
  chargers: Charger[];
  chargerStatesByChargerId: Map<number, ChargerState>;
};

function StationStats({
  chargers,
  chargerStatesByChargerId,
}: StationStatsProps) {
  const activeCount = chargers.filter((charger) =>
    chargerStatesByChargerId.get(charger.id)?.isActive
  ).length;

  const queueCount = chargers.reduce(
    (sum, charger) => sum + (chargerStatesByChargerId.get(charger.id)?.queueSize ?? 0),
    0
  );

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




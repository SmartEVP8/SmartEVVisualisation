import type { Map as LeafletMap } from 'leaflet';
import { useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Polyline } from 'react-leaflet';
import { Clock, PauseIcon, PlayIcon, SlidersHorizontal, Truck, Zap } from 'lucide-react';

import { MapView } from '../components/map/MapView';
import { StationMarkers } from '../components/map/StationMarkers';
import { StationSidebar } from '../components/SimulationPage/StationSidebar';
import { UpdateWeightsSidebar } from '@/components/SimulationPage/UpdateWeightsBar';
import { SimulationSetupForm } from '../components/SimulationSetup/SimulationSetupForm';
import { Button } from '@/components/ui/button';

import { evsOnRouteAtom, globalStatsAtom, simulationTimeAtom, type Position } from '@/store/simulationStore';
import {
  isShowingRoutesAtom,
  selectedStationAtom,
} from '@/store/uiStore';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { msToPrettyDisplay } from '@/lib/msToPrettyDisplay';

type RoutePoint = [number, number];

export function SimulationPage() {
  const mapRef = useRef<LeafletMap | null>(null);
  const [hasSimStarted, setHasSimStarted] = useState(false);
  const [isWeightsSidebarOpen, setIsWeightsSidebarOpen] = useState(false);

  const selectedStationPayload = useAtomValue(selectedStationAtom);
  const isShowingRoutes = useAtomValue(isShowingRoutesAtom);
  const evsOnRoute = useAtomValue(evsOnRouteAtom);

  const incomingRoutes = useMemo(() => {
    if (!selectedStationPayload) return [];
    return evsOnRoute[selectedStationPayload.station.id] || [];
  }, [selectedStationPayload, evsOnRoute]);

  const handleShowIncomingRoutes = (points: Position[]) => {
    const mapped = points.map((point) => [point.lat, point.lon] as RoutePoint);

    if (mapped.length <= 2) return;

    mapRef.current?.fitBounds(mapped, {
      padding: [40, 40],
      maxZoom: 14,
      animate: true,
      duration: 0.5,
    });
  };

  const handleFocusPosition = (lat: number, lon: number) => {
    mapRef.current?.flyTo([lat, lon], 18, {
      animate: true,
      duration: 0.7,
    });
  };

  if (!hasSimStarted) {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
        <MapView mapRef={mapRef} />
        <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <SimulationSetupForm closeOnSimulationStart={setHasSimStarted} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground">
      <MapView mapRef={mapRef}>
        <StationMarkers />

        {isShowingRoutes &&
          selectedStationPayload &&
          incomingRoutes.map((route) => {
            if (route.waypoints.length === 0) return null;

            return (
              <Polyline
                key={`route-${route.id}`}
                positions={route.waypoints.map(
                  (waypoint) => [waypoint.lat, waypoint.lon] as RoutePoint
                )}
                pathOptions={{ color: '#22d3ee', weight: 4, opacity: 0.85 }}
              />
            );
          })}
      </MapView>
      <Topbar />

      {!isWeightsSidebarOpen && (
        <Button
          type="button"
          variant="default"
          size="icon-lg"
          className="absolute top-4 left-4 z-[1200]"
          onClick={() => setIsWeightsSidebarOpen((current) => !current)}
          aria-label="Toggle weights sidebar"
        >
          <SlidersHorizontal />
        </Button>
      )}

      {isWeightsSidebarOpen && (
        <UpdateWeightsSidebar
          onClose={() => setIsWeightsSidebarOpen(false)}
        />
      )}

      {selectedStationPayload && (
        <StationSidebar
          onShowIncomingRoutes={handleShowIncomingRoutes}
          onFocusStation={handleFocusPosition}
        />
      )}
    </div>
  );
}


const Topbar = () => {
  //TODO: WIRE UP TO PLAY AND PAUSE
  const time = useAtomValue(simulationTimeAtom);
  const simState = useAtomValue(globalStatsAtom);
  const [isRunning, setIsRunning] = useState(true)

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1200]">
      <Card className="flex flex-row items-center gap-0 px-5 py-2.5 shadow-none">
        <div className="flex items-center gap-4 pr-5">
          <Truck className="w-5 h-5 text-blue-500 shrink-0" />
          <span className="text-base font-medium font-mono">{simState.totalEvs}</span>
        </div>

        <Button
          variant={isRunning ? "default" : "outline"}
          onClick={() => setIsRunning(prev => !prev)}>
          {isRunning ? <PauseIcon /> : <PlayIcon />}
          {isRunning ? "Pause" : "Resume"}
        </Button>

        <div className="flex items-center gap-4 px-5">
          <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
          <span className="text-base font-medium font-mono">{msToPrettyDisplay(time)}</span>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-4 pl-5">
          <Zap className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="text-base font-medium font-mono">{simState.totalCharging}</span>
        </div>
      </Card>
    </div>
  );
};

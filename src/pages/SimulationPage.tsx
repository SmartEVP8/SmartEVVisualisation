import type { Map as LeafletMap } from 'leaflet';
import { useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Polyline } from 'react-leaflet';
import { SlidersHorizontal } from 'lucide-react';

import { MapView } from '../components/map/MapView';
import { StationMarkers } from '../components/map/StationMarkers';
import { StationSidebar } from '../components/SimulationPage/StationSidebar';
import { UpdateWeightsSidebar } from '@/components/SimulationPage/UpdateWeightsBar';
import { SimulationSetupForm } from '../components/SimulationSetup/SimulationSetupForm';
import { Button } from '@/components/ui/button';

import { evsOnRouteAtom, type Position } from '@/store/simulationStore';
import {
  isShowingRoutesAtom,
  selectedStationAtom,
} from '@/store/uiStore';

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
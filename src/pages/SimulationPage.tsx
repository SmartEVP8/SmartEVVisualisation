import type { Map as LeafletMap } from 'leaflet';
import { useRef, useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { Polyline } from 'react-leaflet';
import { MapView } from '../components/map/MapView';
import { StationMarkers } from '../components/map/StationMarkers';
import { StationSidebar } from '../components/SimulationPage/StationSidebar';
import { SimulationSetupForm } from '../components/SimulationSetup/SimulationSetupForm';
import { evsOnRouteAtom, type Position } from '@/store/simulationStore';
import {
  selectedStationAtom,
  isShowingRoutesAtom,
} from '@/store/uiStore';

type RoutePoint = [number, number];

export function SimulationPage() {
  const mapRef = useRef<LeafletMap | null>(null);
  const [hasSimStarted, setHasSimStarted] = useState<boolean>(false);

  const selectedStationPayload = useAtomValue(selectedStationAtom);
  const isShowingRoutes = useAtomValue(isShowingRoutesAtom);
  const evsOnRoute = useAtomValue(evsOnRouteAtom);

  const incomingRoutes = useMemo(() => {
    if (!selectedStationPayload) return [];
    return evsOnRoute[selectedStationPayload.station.id] || [];
  }, [selectedStationPayload, evsOnRoute]);

  const handleShowIncomingRoutes = (points: Position[]) => {
    const mapped = points.map(elm => [elm.lat, elm.lon] as RoutePoint);
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
      <div className="bg-background text-foreground relative h-screen w-screen overflow-hidden">
        <MapView mapRef={mapRef} />
        <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <SimulationSetupForm closeOnSimulationStart={setHasSimStarted} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground relative h-screen w-screen overflow-hidden">
      <MapView mapRef={mapRef}>
        <StationMarkers />

        {isShowingRoutes && selectedStationPayload &&
          incomingRoutes.map((route) => {
            const routePositions = route.waypoints;

            if (routePositions.length === 0) return null;

            return (
              <Polyline
                key={`route-${route.id}`}
                positions={routePositions.map(wp => [wp.lat, wp.lon] as RoutePoint)}
                pathOptions={{ color: '#22d3ee', weight: 4, opacity: 0.85 }}
              />
            );
          })}
      </MapView>

      {selectedStationPayload && (
        <StationSidebar
          onShowIncomingRoutes={handleShowIncomingRoutes}
          onFocusStation={handleFocusPosition}
        />
      )}
    </div>
  );
}

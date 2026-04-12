import type { Map as LeafletMap } from 'leaflet';
import { useRef, useState } from 'react';
import { MapView } from '../components/map/MapView';
import { StationMarkers } from '../components/map/StationMarkers';
import { Polyline } from 'react-leaflet';
import { StationSidebar } from '../components/SimulationPage/StationSidebar';
import { SimulationSetupForm } from '../components/SimulationSetup/SimulationSetupForm';
import type { Position } from '@/api/generated/api_pb';

type RoutePoint = [number, number];

export function SimulationPage() {
  const mapRef = useRef<LeafletMap | null>(null);
  const [simHasStarted, setSimHasStarted] = useState<boolean>(false)

  const handleShowIncomingRoutes = (points: Position[]) => {
    const mapped = points.map(elm => [elm.lat, elm.lon] as RoutePoint)
    if (mapped.length <= 2)
      return;

    mapRef.current?.fitBounds(mapped, {
      padding: [40, 40],
      maxZoom: 14,
      animate: true,
      duration: 0.5,
    });
  };

  const handleFocusPosition = (lat: number, lon: number) =>
    mapRef.current?.flyTo([lat, lon], 18, {
      animate: true,
      duration: 0.7,
    });

  if (!simHasStarted) {
    return (
      <div className="bg-background text-foreground relative h-screen w-screen overflow-hidden">
        <MapView mapRef={mapRef} />
        <div className="absolute inset-0 z-1100 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <SimulationSetupForm closeOnSimulationStart={setSimHasStarted} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground relative h-screen w-screen overflow-hidden">
      <MapView mapRef={mapRef}>
        <StationMarkers
          stations={simulation.stations}
          chargersByStationId={simulation.chargersByStationId}
          onSelect={selection.selectStation}
        />

        {panel.isShowingRoutes && selection.selectedStation &&
          mockIncomingRoutes.map((route) => {
            const routePositions = route.waypoints;

            if (routePositions.length === 0) {
              return null;
            }

            return (
              <Polyline
                key={`route-${route.evId}`}
                positions={routePositions}
                pathOptions={{ color: '#22d3ee', weight: 4, opacity: 0.85 }}
              />
            );
          })}
      </MapView>
      <StationSidebar
        selectedStation={selection.selectedStation}
        chargerStatesByChargerId={simulation.chargerStatesByChargerId}
        onClose={selection.clearSelection}
        onShowIncomingRoutes={handleShowIncomingRoutes}
        onFocusStation={handleFocusPosition}
        isCollapsed={panel.isSidebarCollapsed}
        onToggleCollapsed={panel.toggleSidebarCollapsed}
      />
    </div>
  );
}

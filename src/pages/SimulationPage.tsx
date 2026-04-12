import type { Map as LeafletMap } from 'leaflet';
import { useMemo, useRef } from 'react';
import { MapView } from '../components/map/MapView';
import { StationMarkers } from '../components/map/StationMarkers';
import { Polyline } from 'react-leaflet';
import { StationSidebar } from '../components/SimulationPage/StationSidebar';
import { SimulationSetupForm } from '../components/SimulationSetup/SimulationSetupForm';
import { StartSimulationButton } from '../components/SimulationSetup/StartSimulationButton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useSimulationPageController } from '../hooks/useSimulationPageController';

type RoutePoint = [number, number];
type MockIncomingRoute = { evId: number; waypoints: RoutePoint[] };

export function SimulationPage() {
  const mapRef = useRef<LeafletMap | null>(null);

  const {
    simulation,
    setup,
    selection,
    panel,
  } = useSimulationPageController();

  const mockIncomingRoutes = useMemo(() => {
    if (!selection.selectedStation) {
      return [] as MockIncomingRoute[];
    }

    const { lat, lon } = selection.selectedStation.station.pos;

    return [
      {
        evId: 9001,
        waypoints: [
          [lat + 0.065, lon - 0.08] as RoutePoint,
          [lat + 0.035, lon - 0.045] as RoutePoint,
          [lat + 0.012, lon - 0.012] as RoutePoint,
          [lat, lon] as RoutePoint,
        ],
      },
      {
        evId: 9002,
        waypoints: [
          [lat - 0.055, lon + 0.06] as RoutePoint,
          [lat - 0.03, lon + 0.03] as RoutePoint,
          [lat - 0.012, lon + 0.01] as RoutePoint,
          [lat, lon] as RoutePoint,
        ],
      },
      {
        evId: 9003,
        waypoints: [
          [lat + 0.02, lon + 0.09] as RoutePoint,
          [lat + 0.012, lon + 0.05] as RoutePoint,
          [lat + 0.006, lon + 0.02] as RoutePoint,
          [lat, lon] as RoutePoint,
        ],
      },
    ] as MockIncomingRoute[];
  }, [selection.selectedStation]);


  const handleShowIncomingRoutes = () => {
    const routePoints = mockIncomingRoutes.flatMap((route) => route.waypoints);

    panel.collapse();
    if (routePoints.length === 0) {
      return;
    }

    mapRef.current?.fitBounds(routePoints, {
      padding: [40, 40],
      maxZoom: 14,
      animate: true,
      duration: 0.5,
    });
  };

  const handleFocusStation = () => {
    if (!selection.selectedStation) {
      return;
    }

    const { lat, lon } = selection.selectedStation.station.pos;

    mapRef.current?.flyTo([lat, lon], 18, {
      animate: true,
      duration: 0.7,
    });
  };

  return (
    <div className="bg-background text-foreground relative h-screen w-screen overflow-hidden">
      <MapView mapRef={mapRef}>
        <StationMarkers
          hasStarted={simulation.hasStarted}
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

      <div className="absolute top-4 left-4 z-1000 w-70">
        {!simulation.hasStarted && (
          <StartSimulationButton
            onOpen={setup.openModal}
            disabled={setup.isLoadingWeights || simulation.isStarting}
          />
        )}

        {setup.weightsError && !setup.isModalOpen && (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription>{setup.weightsError}</AlertDescription>
          </Alert>
        )}

        {simulation.error && !setup.isModalOpen && (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription>{simulation.error}</AlertDescription>
          </Alert>
        )}

  

      </div>

      {setup.isModalOpen && (
        <div className="absolute inset-0 z-1100 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <SimulationSetupForm
            onClose={setup.closeModal}
            weightMetadata={setup.weightMetadata}
            initialCostWeights={setup.initialCostWeights}
            onStart={simulation.start}
          />
        </div>
      )}

      {simulation.hasStarted && selection.selectedStation && (
        <StationSidebar
          selectedStation={selection.selectedStation}
          chargerStatesByChargerId={simulation.chargerStatesByChargerId}
          onClose={selection.clearSelection}
          onShowIncomingRoutes={handleShowIncomingRoutes}
          onFocusStation={handleFocusStation}
          isCollapsed={panel.isSidebarCollapsed}
          onToggleCollapsed={panel.toggleSidebarCollapsed}
        />
      )}
    </div>
  );
}

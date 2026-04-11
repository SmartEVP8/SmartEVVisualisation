import { useMemo, useState } from 'react';
import { Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapView } from '../components/map/MapView';
import { StationMarker } from '../components/map/StationMarker';
import { StationSidebar } from '../components/SimulationPage/StationSidebar';
import { SimulationSetupForm } from '../components/SimulationSetup/SimulationSetupForm';
import { StartSimulationButton } from '../components/SimulationSetup/StartSimulationButton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { useSimulationPageController } from '../hooks/useSimulationPageController';

type RoutePoint = [number, number];
type MockIncomingRoute = { evId: number; waypoints: RoutePoint[] };

export function SimulationPage() {
  const [showIncomingRoutes, setShowIncomingRoutes] = useState(false);

  const {
    stations,
    isSimulationStarting,
    simulationError,
    hasSimulationStarted,
    isOpen,
    isLoadingWeights,
    weightsError,
    weightMetadata,
    initialCostWeights,
    open,
    close,
    selectedStation,
    chargerStatesByChargerId,
    selectStation,
    closeStation,
    chargersByStationId,
    handleStartSimulation,
  } = useSimulationPageController();

  const mockIncomingRoutes = useMemo(() => {
    if (!selectedStation) {
      return [] as MockIncomingRoute[];
    }

    const { lat, lon } = selectedStation.station.pos;

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
  }, [selectedStation]);

  return (
    <div className="bg-background text-foreground relative h-screen w-screen overflow-hidden">
      <MapView>
        {hasSimulationStarted && (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={35}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
          >
            {stations.map((station) => {
              const stationChargers = chargersByStationId.get(station.id) ?? [];

              return (
                <StationMarker
                  key={station.id}
                  station={station}
                  chargers={stationChargers}
                  onSelect={selectStation}
                />
              );
            })}
          </MarkerClusterGroup>
        )}

        {showIncomingRoutes && selectedStation &&
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
        {!hasSimulationStarted && (
          <StartSimulationButton
            onOpen={open}
            disabled={isLoadingWeights || isSimulationStarting}
          />
        )}

        {weightsError && !isOpen && (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription>{weightsError}</AlertDescription>
          </Alert>
        )}

        {simulationError && !isOpen && (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription>{simulationError}</AlertDescription>
          </Alert>
        )}

        {hasSimulationStarted && selectedStation && showIncomingRoutes && (
          <div className="mt-3 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-xl backdrop-blur-md">
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                onClick={() => setShowIncomingRoutes(false)}
                variant="default"
                className="w-full"
              >
                Show sidebar again
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowIncomingRoutes(false);
                  closeStation();
                }}
                variant="secondary"
                className="w-full"
              >
                Close routes
              </Button>
            </div>
          </div>
        )}

      </div>

      {isOpen && (
        <div className="absolute inset-0 z-1100 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <SimulationSetupForm
            onClose={close}
            weightMetadata={weightMetadata}
            initialCostWeights={initialCostWeights}
            onStart={handleStartSimulation}
          />
        </div>
      )}

      {hasSimulationStarted && selectedStation && !showIncomingRoutes && (
        <StationSidebar
          selectedStation={selectedStation}
          chargerStatesByChargerId={chargerStatesByChargerId}
          onClose={closeStation}
          onShowIncomingRoutes={() => setShowIncomingRoutes(true)}
        />
      )}
    </div>
  );
}
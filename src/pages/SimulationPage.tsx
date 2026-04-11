import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapView } from '../components/map/MapView';
import { StationMarker } from '../components/map/StationMarker';
import { StationSidebar } from '../components/SimulationPage/StationSidebar';
import { SimulationSetupForm } from '../components/SimulationSetup/SimulationSetupForm';
import { StartSimulationButton } from '../components/SimulationSetup/StartSimulationButton';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useSimulationPageController } from '../hooks/useSimulationPageController';

export function SimulationPage() {
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
      </MapView>

      <div className="absolute top-4 left-4 z-[1000] w-[280px]">
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
      </div>

      {isOpen && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <SimulationSetupForm
            onClose={close}
            weightMetadata={weightMetadata}
            initialCostWeights={initialCostWeights}
            onStart={handleStartSimulation}
          />
        </div>
      )}

      {hasSimulationStarted && (
        <StationSidebar
          selectedStation={selectedStation}
          chargerStatesByChargerId={chargerStatesByChargerId}
          onClose={closeStation}
        />
      )}
    </div>
  );
}
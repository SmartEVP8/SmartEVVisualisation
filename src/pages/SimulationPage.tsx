import { useMemo } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapView } from '../components/map/MapView';
import { StationMarker } from '../components/map/StationMarker';
import { StartSimulationButton } from '../components/SimulationSetup/StartSimulationButton';
import { SimulationSetupForm } from '../components/SimulationSetup/SimulationSetupForm';
import { StationSidebar } from '../components/SimulationPage/StationSidebar';
import { ChargerSidebar } from '../components/SimulationPage/ChargerSidebar';
import { useSimulationData } from '../hooks/useSimulationData';
import { useSimulationSetupWeights } from '../hooks/useSimulationSetupWeights';
import { useStationSelection } from '../hooks/useStationSelection';
import type { Charger } from '../types/station';

export function SimulationPage() {
  const {
    stations,
    chargers,
    chargerStates,
    isSimulationStarting,
    simulationError,
    hasSimulationStarted,
    startSimulation,
  } = useSimulationData();

  const {
    isOpen,
    isLoadingWeights,
    weightsError,
    weightMetadata,
    initialCostWeights,
    open,
    close,
  } = useSimulationSetupWeights(isSimulationStarting);

  const {
    selectedStation,
    selectedChargerId,
    selectedCharger,
    selectedChargerState,
    chargerStatesByChargerId,
    setSelectedChargerId,
    selectStation,
    closeStation,
    closeCharger,
    resetSelection,
  } = useStationSelection({ chargerStates });

  const chargersByStationId = useMemo(() => {
    const map = new Map<number, Charger[]>();

    for (const charger of chargers) {
      const existing = map.get(charger.stationId) ?? [];
      existing.push(charger);
      map.set(charger.stationId, existing);
    }

    return map;
  }, [chargers]);

  const handleStartSimulation = async (config: any) => {
    try {
      await startSimulation(config);
      close();
      resetSelection();
    } catch (error) {
      console.error('Failed to initialize simulation:', error);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white">
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

      <div className="absolute left-4 top-4 z-[1000] w-[280px]">
        {!hasSimulationStarted && (
          <StartSimulationButton
            onOpen={open}
            disabled={isLoadingWeights || isSimulationStarting}
          />
        )}

        {weightsError && !isOpen && (
          <div className="mt-3 text-sm text-red-400">{weightsError}</div>
        )}

        {simulationError && !isOpen && (
          <div className="mt-3 text-sm text-red-400">{simulationError}</div>
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
        <>
          <StationSidebar
            selectedStation={selectedStation}
            selectedChargerId={selectedChargerId}
            chargerStatesByChargerId={chargerStatesByChargerId}
            onClose={closeStation}
            onSelectCharger={setSelectedChargerId}
          />

          <ChargerSidebar
            selectedCharger={selectedCharger}
            selectedChargerState={selectedChargerState}
            onClose={closeCharger}
          />
        </>
      )}
    </div>
  );
}
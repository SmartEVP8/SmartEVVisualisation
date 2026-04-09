import { useMemo, useState } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapView } from '../components/map/MapView';
import { StationMarker } from '../components/map/StationMarker';
import { Sidebar } from '../components/UI/sidebar';
import { ListItem } from '../components/UI/ListItem';
import { getWeights } from '../api/weights';
import { initializeSimulation } from '../api/init';
import type {
  WeightMetadata,
  InitEngineConfig,
  InitEngineResponse,
} from '../api/types';
import { StartSimulationButton } from '../components/SimulationSetup/StartSimulationButton';
import { SimulationSetupForm } from '../components/SimulationSetup/SimulationSetupForm';
import type { Station, Charger } from '../types/station';
import type { ChargerState } from '../types/chargerState';

type SelectedStation = {
  station: Station;
  chargers: Charger[];
} | null;

async function initializeWeights(): Promise<{
  weightMetadata: WeightMetadata[];
  costWeights: InitEngineConfig['costWeights'];
}> {
  const weights = await getWeights();

  return {
    weightMetadata: weights,
    costWeights: weights.map((weight) => ({
      costId: weight.id,
      value: weight.min,
    })),
  };
}

function mapInitResponseToStations(response: InitEngineResponse): Station[] {
  return response.stations.map((station) => ({
    id: station.id,
    address: station.address,
    pos: {
      lat: station.pos?.lat ?? 0,
      lon: station.pos?.lon ?? 0,
    },
  }));
}

function mapInitResponseToChargers(response: InitEngineResponse): Charger[] {
  return response.chargers.map((charger) => ({
    id: charger.id,
    maxPowerKW: charger.maxPowerKw,
    isDual: charger.isDual,
    stationId: charger.stationId,
  }));
}

export function SimulationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingWeights, setIsLoadingWeights] = useState(false);
  const [weightsError, setWeightsError] = useState<string | null>(null);

  const [isSimulationStarting, setIsSimulationStarting] = useState(false);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [hasSimulationStarted, setHasSimulationStarted] = useState(false);

  const [weightMetadata, setWeightMetadata] = useState<WeightMetadata[]>([]);
  const [initialCostWeights, setInitialCostWeights] = useState<
    InitEngineConfig['costWeights']
  >([]);

  const [stations, setStations] = useState<Station[]>([]);
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [chargerStates, setChargerStates] = useState<ChargerState[]>([]);

  const [selectedStation, setSelectedStation] = useState<SelectedStation>(null);
  const [selectedChargerId, setSelectedChargerId] = useState<number | null>(null);

  const selectedCharger = useMemo(() => {
    if (!selectedStation || selectedChargerId === null) {
      return null;
    }

    return (
      selectedStation.chargers.find((charger) => charger.id === selectedChargerId) ??
      null
    );
  }, [selectedStation, selectedChargerId]);

  const selectedChargerState = useMemo(() => {
    if (selectedChargerId === null) {
      return null;
    }

    return (
      chargerStates.find((chargerState) => chargerState.chargerId === selectedChargerId) ??
      null
    );
  }, [chargerStates, selectedChargerId]);

  const handleOpen = async () => {
    try {
      setIsLoadingWeights(true);
      setWeightsError(null);

      const { weightMetadata, costWeights } = await initializeWeights();

      setWeightMetadata(weightMetadata);
      setInitialCostWeights(costWeights);
      setIsOpen(true);
    } catch (error) {
      setWeightsError(
        error instanceof Error ? error.message : 'Failed to load weights'
      );
    } finally {
      setIsLoadingWeights(false);
    }
  };

  const handleClose = () => {
    if (isSimulationStarting) {
      return;
    }

    setIsOpen(false);
  };

  const handleCloseStationSidebar = () => {
    setSelectedStation(null);
    setSelectedChargerId(null);
  };

  const handleSelectStation = (station: Station, stationChargers: Charger[]) => {
    setSelectedStation({
      station,
      chargers: stationChargers,
    });
    setSelectedChargerId(null);
  };

  const handleStartSimulation = async (config: InitEngineConfig) => {
    try {
      setIsSimulationStarting(true);
      setSimulationError(null);

      console.log('Initializing simulation with config:', config);

      const response = await initializeSimulation(config);

      const mappedStations = mapInitResponseToStations(response);
      const mappedChargers = mapInitResponseToChargers(response);

      setStations(mappedStations);
      setChargers(mappedChargers);

      // Init response does not contain charger states anymore,
      // so we start with empty/default state until websocket updates arrive.
      setChargerStates([]);

      setHasSimulationStarted(true);
      setIsOpen(false);
      setSelectedStation(null);
      setSelectedChargerId(null);
    } catch (error) {
      setSimulationError(
        error instanceof Error ? error.message : 'Failed to initialize simulation'
      );
      console.error('Failed to initialize simulation:', error);
    } finally {
      setIsSimulationStarting(false);
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
              const stationChargers = chargers.filter(
                (charger) => charger.stationId === station.id
              );

              return (
                <StationMarker
                  key={station.id}
                  station={station}
                  chargers={stationChargers}
                  onSelect={handleSelectStation}
                />
              );
            })}
          </MarkerClusterGroup>
        )}
      </MapView>

      <div className="absolute left-4 top-4 z-[1000] w-[280px]">
        {!hasSimulationStarted && (
          <StartSimulationButton
            onOpen={handleOpen}
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
            onClose={handleClose}
            weightMetadata={weightMetadata}
            initialCostWeights={initialCostWeights}
            onStart={handleStartSimulation}
          />
        </div>
      )}

      {hasSimulationStarted && (
        <>
          <Sidebar
            isOpen={selectedStation !== null}
            title={selectedStation?.station.address ?? 'Station'}
            onClose={handleCloseStationSidebar}
            side="right"
            offset={selectedChargerId !== null ? 360 : 0}
          >
            {selectedStation?.chargers.length ? (
              selectedStation.chargers.map((charger) => {
                const chargerState =
                  chargerStates.find((state) => state.chargerId === charger.id) ?? null;

                return (
                  <ListItem
                    key={charger.id}
                    onClick={() => setSelectedChargerId(charger.id)}
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">Charger ID</span>
                      <span className="text-neutral-300">{charger.id}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold text-white">Max power</span>
                      <span className="text-neutral-300">{charger.maxPowerKW} kW</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold text-white">Status</span>
                      <span className="text-neutral-300">
                        {chargerState?.isActive ? 'Active' : 'Free'}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold text-white">Queue</span>
                      <span className="text-neutral-300">
                        {chargerState?.queueSize ?? 0}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="font-semibold text-white">Dual</span>
                      <span className="text-neutral-300">
                        {charger.isDual ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </ListItem>
                );
              })
            ) : (
              <ListItem>
                <div className="text-sm text-neutral-300">
                  No chargers found for this station.
                </div>
              </ListItem>
            )}
          </Sidebar>

          <Sidebar
            isOpen={selectedCharger !== null}
            title={selectedCharger ? `Charger ${selectedCharger.id}` : 'Charger'}
            onClose={() => setSelectedChargerId(null)}
            side="right"
          >
            {selectedCharger ? (
              <>
                <ListItem>
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Charger ID</span>
                    <span className="text-neutral-300">{selectedCharger.id}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Max power</span>
                    <span className="text-neutral-300">
                      {selectedCharger.maxPowerKW} kW
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Dual</span>
                    <span className="text-neutral-300">
                      {selectedCharger.isDual ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Status</span>
                    <span className="text-neutral-300">
                      {selectedChargerState?.isActive ? 'Active' : 'Free'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Utilisation</span>
                    <span className="text-neutral-300">
                      {selectedChargerState
                        ? `${Math.round(selectedChargerState.utilization * 100)}%`
                        : '0%'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Queue size</span>
                    <span className="text-neutral-300">
                      {selectedChargerState?.queueSize ?? 0}
                    </span>
                  </div>
                </ListItem>

                <div className="px-1 pt-1 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  Queue for this charger
                </div>

                {selectedChargerState && selectedChargerState.evsInQueue.length > 0 ? (
                  selectedChargerState.evsInQueue.map((ev) => (
                    <ListItem key={ev.evID}>
                      <div className="flex justify-between">
                        <span className="font-semibold text-white">Car ID</span>
                        <span className="text-neutral-300">{ev.evID}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-semibold text-white">SoC</span>
                        <span className="text-neutral-300">
                          {Math.round(ev.SoC * 100)}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-semibold text-white">Target SoC</span>
                        <span className="text-neutral-300">
                          {Math.round(ev.targetSoC * 100)}%
                        </span>
                      </div>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <div className="text-sm text-neutral-300">
                      No cars are waiting for this charger.
                    </div>
                  </ListItem>
                )}
              </>
            ) : (
              <ListItem>
                <div className="text-sm text-neutral-300">
                  No charger selected.
                </div>
              </ListItem>
            )}
          </Sidebar>
        </>
      )}
    </div>
  );
}
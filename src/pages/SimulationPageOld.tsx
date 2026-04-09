import { useMemo, useState } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapView } from '../components/map/MapView';
import { StationMarker } from '../components/map/StationMarker';
import { Sidebar } from '../components/UI/sidebar';
import { ListItem } from '../components/UI/ListItem';
import type { Station, Charger } from '../types/station';
import type { ChargerState } from '../types/chargerState';
import type { InitRequest } from '../types/simulationConfig';

type SimulationPageProps = {
  stations: Station[];
  chargers: Charger[];
  chargerStates: ChargerState[];
  hasSimulationStarted: boolean;
  isSimulationStarting?: boolean;
  onStartSimulation: (config: InitRequest) => Promise<void> | void;
};

type SelectedStation = {
  station: Station;
  chargers: Charger[];
} | null;

const defaultInitRequest: InitRequest = {
  costWeights: [],
  stationGenerationOptions: {
    dualChargingProbability: 0.5,
    numberOfChargers: 50,
  },
  maximumNumberOfEVs: 100,
  seed: 42,
};

export function SimulationPage({
  stations,
  chargers,
  chargerStates,
  hasSimulationStarted,
  isSimulationStarting = false,
  onStartSimulation,
}: SimulationPageProps) {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<SelectedStation>(null);
  const [selectedChargerId, setSelectedChargerId] = useState<number | null>(null);

  const selectedCharger = useMemo(() => {
    if (!selectedStation || selectedChargerId === null) {
      return null;
    }

    return (
      selectedStation.chargers.find((charger) => charger.id === selectedChargerId) ?? null
    );
  }, [selectedStation, selectedChargerId]);

  const selectedChargerState = useMemo(() => {
    if (selectedChargerId === null) {
      return null;
    }

    return (
      chargerStates.find((chargerState) => chargerState.chargerId === selectedChargerId) ?? null
    );
  }, [chargerStates, selectedChargerId]);

  function handleOpenSetup() {
    setIsSetupOpen(true);
  }

  function handleCloseSetup() {
    if (isSimulationStarting) {
      return;
    }

    setIsSetupOpen(false);
  }

  function handleCloseStationSidebar() {
    setSelectedStation(null);
    setSelectedChargerId(null);
  }

  function handleSelectStation(station: Station, stationChargers: Charger[]) {
    setSelectedStation({
      station,
      chargers: stationChargers,
    });
    setSelectedChargerId(null);
  }

  async function handleStartSimulationClick() {
    await onStartSimulation(defaultInitRequest);
    setIsSetupOpen(false);
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
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
                (charger) => charger.stationId === station.id,
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

      {!hasSimulationStarted && !isSetupOpen && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={handleOpenSetup}
              className="rounded-2xl border border-blue-500 bg-neutral-900/95 px-8 py-4 text-lg font-semibold text-white shadow-xl transition hover:bg-neutral-800"
            >
              Start simulation
            </button>
          </div>
        </div>
      )}

      {isSetupOpen && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-2xl rounded-[2rem] border-4 border-blue-500 bg-white/95 px-8 py-8 shadow-xl">
            <h2 className="mb-6 text-center text-3xl font-bold text-neutral-900">
              Setup Configuration
            </h2>

            <div className="space-y-4 text-neutral-800">
              <div className="rounded-2xl border-2 border-neutral-200 bg-neutral-50 p-4">
                <div className="mb-2 font-semibold">Temporary setup preview</div>

                <div className="flex justify-between">
                  <span>Maximum EVs</span>
                  <span>{defaultInitRequest.maximumNumberOfEVs}</span>
                </div>

                <div className="flex justify-between">
                  <span>Seed</span>
                  <span>{defaultInitRequest.seed}</span>
                </div>

                <div className="flex justify-between">
                  <span>Dual charging probability</span>
                  <span>
                    {defaultInitRequest.stationGenerationOptions.dualChargingProbability}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Chargers</span>
                  <span>
                    {defaultInitRequest.stationGenerationOptions.numberOfChargers}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Cost weights</span>
                  <span>{defaultInitRequest.costWeights.length}</span>
                </div>
              </div>

              <p className="text-sm text-neutral-600">
                This is a temporary placeholder until the real setup form is built.
              </p>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseSetup}
                disabled={isSimulationStarting}
                className="rounded-xl border border-neutral-300 px-5 py-3 font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartSimulationClick}
                disabled={isSimulationStarting}
                className="rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSimulationStarting ? 'Starting...' : 'Start simulation'}
              </button>
            </div>
          </div>
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
            {selectedCharger && selectedChargerState ? (
              <>
                <ListItem>
                  {selectedChargerState.activeEVId ? (
                    <>
                      <div className="flex justify-between">
                        <span className="font-semibold text-white">Car ID</span>
                        <span className="text-neutral-300">
                          {selectedChargerState.activeEVId.evID}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-semibold text-white">SoC</span>
                        <span className="text-neutral-300">
                          {Math.round(selectedChargerState.activeEVId.SoC * 100)}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-semibold text-white">Target SoC</span>
                        <span className="text-neutral-300">
                          {Math.round(selectedChargerState.activeEVId.targetSoC * 100)}%
                        </span>
                      </div>

                      <div className="mt-2">
                        <div className="mb-1 flex justify-between text-xs text-neutral-400">
                          <span>Charge progress</span>
                          <span>
                            {Math.round(selectedChargerState.activeEVId.SoC * 100)}% /{' '}
                            {Math.round(
                              selectedChargerState.activeEVId.targetSoC * 100,
                            )}
                            %
                          </span>
                        </div>

                        <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-700">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                (selectedChargerState.activeEVId.SoC /
                                  selectedChargerState.activeEVId.targetSoC) *
                                  100,
                                100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-neutral-300">
                      No car is currently charging.
                    </div>
                  )}
                </ListItem>

                <div className="px-1 pt-1 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  Queue for this charger
                </div>

                {selectedChargerState.evsInQueue.length > 0 ? (
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
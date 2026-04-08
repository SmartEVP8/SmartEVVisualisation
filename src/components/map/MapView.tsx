import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import type { LatLngBoundsExpression } from 'leaflet';
import type { Station, Charger } from '../../types/station';
import type { ChargerState } from '../../types/chargerState';
import { StationMarker } from './StationMarker';
import { Sidebar } from '../UI/sidebar';
import { ListItem } from '../UI/ListItem';

type MapViewProps = {
  stations: Station[];
  chargers: Charger[];
  chargerStates: ChargerState[];
};

type SelectedStation = {
  station: Station;
  chargers: Charger[];
} | null;

const key = import.meta.env.VITE_MAPTILER_KEY as string;

const boundingBox: LatLngBoundsExpression = [
  [54.5, 8.0],
  [57.8, 12.7],
];

export function MapView({ stations, chargers, chargerStates }: MapViewProps) {
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

  return (
    <div className="relative h-full w-full">
      <MapContainer
        minZoom={8}
        maxZoom={18}
        style={{ height: '100%', width: '100%' }}
        bounds={boundingBox}
        maxBounds={boundingBox}
        maxBoundsViscosity={1.0}
        zoomControl={false}
      >
        <TileLayer
          url={`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${key}`}
          tileSize={512}
          zoomOffset={-1}
          noWrap
          attribution="&copy; MapTiler &copy; OpenStreetMap contributors"
        />

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
                onSelect={(selectedStation, selectedChargers) => {
                  handleSelectStation(selectedStation, selectedChargers);
                }}
              />
            );
          })}
        </MarkerClusterGroup>

        <ZoomControl position="bottomleft" />
      </MapContainer>

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
                        {Math.round(selectedChargerState.activeEVId.targetSoC * 100)}%
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
    </div>
  );
}
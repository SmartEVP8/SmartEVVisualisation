import { Sidebar } from '../UI/sidebar';
import { ListItem } from '../UI/ListItem';
import type { Charger, Station } from '../../types/station';
import type { ChargerState } from '../../types/chargerState';

type StationSidebarProps = {
  selectedStation: {
    station: Station;
    chargers: Charger[];
  } | null;
  selectedChargerId: number | null;
  chargerStatesByChargerId: Map<number, ChargerState>;
  onClose: () => void;
  onSelectCharger: (chargerId: number) => void;
};

export function StationSidebar({
  selectedStation,
  selectedChargerId,
  chargerStatesByChargerId,
  onClose,
  onSelectCharger,
}: StationSidebarProps) {
  return (
    <Sidebar
      isOpen={selectedStation !== null}
      title={selectedStation?.station.address ?? 'Station'}
      onClose={onClose}
      side="right"
      offset={selectedChargerId !== null ? 360 : 0}
    >
      {selectedStation?.chargers.length ? (
        selectedStation.chargers.map((charger) => {
          const chargerState = chargerStatesByChargerId.get(charger.id) ?? null;

          return (
            <ListItem key={charger.id} onClick={() => onSelectCharger(charger.id)}>
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
  );
}
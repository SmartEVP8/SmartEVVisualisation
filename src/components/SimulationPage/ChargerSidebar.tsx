import { Sidebar } from '../UI/sidebar';
import { ListItem } from '../UI/ListItem';
import type { Charger } from '../../types/station';
import type { ChargerState } from '../../types/chargerState';

type ChargerSidebarProps = {
  selectedCharger: Charger | null;
  selectedChargerState: ChargerState | null;
  onClose: () => void;
};

export function ChargerSidebar({
  selectedCharger,
  selectedChargerState,
  onClose,
}: ChargerSidebarProps) {
  return (
    <Sidebar
      isOpen={selectedCharger !== null}
      title={selectedCharger ? `Charger ${selectedCharger.id}` : 'Charger'}
      onClose={onClose}
      side="right"
    >
      {selectedCharger ? (
        <>
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
  );
}
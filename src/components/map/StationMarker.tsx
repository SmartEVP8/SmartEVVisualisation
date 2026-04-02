import { Marker, Popup } from 'react-leaflet';
import type { Station, Charger } from '../../types/station';
import { StationPopup } from './StationPopup';

type Props = {
  station: Station;
  chargers: Charger[];
};

export function StationMarker({ station, chargers }: Props) {
  return (
    <Marker position={[station.pos.lat, station.pos.lon]}>
      <Popup>
        <StationPopup station={station} chargers={chargers} />
      </Popup>
    </Marker>
  );
}
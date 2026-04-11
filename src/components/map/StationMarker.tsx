import L from 'leaflet';
import React, { useCallback } from 'react';
import { Marker, useMap } from 'react-leaflet';
import stationMarkerIcon from '../../assets/StationMarker.svg';
import type { Charger, Station } from '../../types/station';

type Props = {
  station: Station;
  chargers?: Charger[];
  onSelect: (station: Station, chargers: Charger[]) => void;
};

const icon = L.divIcon({
  className: '',
  html: `
    <div style="position: relative; width: 40px; height: 52px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        inset: 0;
        width: 40px;
        height: 52px;
        background: #3388ff;
        clip-path: path('M20 52C20 52 0 30 0 20C0 8.954 8.954 0 20 0C31.046 0 40 8.954 40 20C40 30 20 52 20 52Z');
      "></div>

      <img
        src="${stationMarkerIcon}"
        alt="Station icon"
        style="
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 16px;
          z-index: 2;
        "
      />
    </div>
  `,
  iconSize: [40, 52],
  iconAnchor: [20, 52],
});

function StationMarkerComponent({ station, chargers = [], onSelect }: Props) {
  const map = useMap();

  const handleClick = useCallback(() => {
    map.flyTo([station.pos.lat, station.pos.lon], 18, {
      duration: 1.2,
    });
    onSelect(station, chargers);
  }, [map, station, chargers, onSelect]);

  return (
    <Marker
      position={[station.pos.lat, station.pos.lon]}
      icon={icon}
      eventHandlers={{
        click: handleClick,
      }}
    />
  );
}

export const StationMarker = React.memo(StationMarkerComponent);
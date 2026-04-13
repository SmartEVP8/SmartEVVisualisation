import L from 'leaflet';
import React, { useCallback, useMemo } from 'react';
import { BatteryCharging } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Marker, useMap } from 'react-leaflet';
import type { StationConfig } from '@/store/simulationStore';
import { useAtomValue } from 'jotai';
import { getStationStatusAtom } from '@/store/simulationStore';

export type StationStatus = 'idle' | 'busy' | 'full';

type Props = {
  station: StationConfig;
  onSelect: (station: StationConfig) => void;
};

const glyph = renderToStaticMarkup(
  <BatteryCharging size={16} color="currentColor" strokeWidth={2.25} aria-hidden="true" />
);

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:40px;height:52px;display:flex;align-items:center;justify-content:center;">
        <div style="
          position:absolute;inset:0;width:40px;height:52px;
          background:${color};
          clip-path:path('M20 52C20 52 0 30 0 20C0 8.954 8.954 0 20 0C31.046 0 40 8.954 40 20C40 30 20 52 20 52Z');
        "></div>
        <div style="position:absolute;top:14px;left:50%;transform:translateX(-50%);width:16px;height:16px;color:#fff;z-index:2;">
          ${glyph}
        </div>
      </div>`,
    iconSize: [40, 52],
    iconAnchor: [20, 52],
  });
}

const STATION_ICONS: Record<StationStatus, L.DivIcon> = {
  idle: makeIcon('#22c55e'),
  busy: makeIcon('#f59e0b'),
  full: makeIcon('#ef4444'),
};

function StationMarkerComponent({ station, onSelect }: Props) {
  const map = useMap();
  const statusAtom = useMemo(() => getStationStatusAtom(station.id), [station.id]);
  const status = useAtomValue(statusAtom);
  const icon = STATION_ICONS[status];

  const handleClick = useCallback(() => {
    map.flyTo([station.pos.lat, station.pos.lon], 18, {
      duration: 1.2,
    });
    onSelect(station);
  }, [map, station, onSelect]);

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

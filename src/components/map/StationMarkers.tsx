import L from 'leaflet';
import React, { useMemo, useCallback } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster';
import { useAtomValue, useSetAtom } from 'jotai';
import { stationsConfigAtom } from '@/store/simulationStore';
import type { StationConfig } from '@/store/simulationStore';
import {
  selectedStationAtom,
  selectedChargerIdAtom,
} from '@/store/uiStore';
import { StationMarker, type StationStatus } from './StationMarker';

type MarkerWithStationMeta = L.Marker & {
  options: L.MarkerOptions & {
    stationStatus?: StationStatus;
    stationId?: number;
  };
};

type MarkerClusterLike = {
  getAllChildMarkers: () => L.Marker[];
  getChildCount: () => number;
};

const CLUSTER_COLOURS = {
  idle: {
    background: '#22c55e',
    outerRing: 'rgba(34, 197, 94, 0.28)',
  },
  busy: {
    background: '#f59e0b',
    outerRing: 'rgba(245, 158, 11, 0.30)',
  },
  full: {
    background: '#ef4444',
    outerRing: 'rgba(239, 68, 68, 0.30)',
  },
} as const;

const clusterIconCache = new Map<string, L.DivIcon>();

function getStatusSeverity(status: StationStatus | undefined): 0 | 1 | 2 {
  switch (status) {
    case 'full':
      return 2;
    case 'busy':
      return 1;
    default:
      return 0;
  }
}

function getSeverityColours(severity: 0 | 1 | 2) {
  switch (severity) {
    case 2:
      return CLUSTER_COLOURS.full;
    case 1:
      return CLUSTER_COLOURS.busy;
    default:
      return CLUSTER_COLOURS.idle;
  }
}

function buildClusterHtml(
  totalCount: number,
  problematicCount: number,
  hasFull: boolean,
  severity: 0 | 1 | 2
) {
  const colours = getSeverityColours(severity);

  return `
    <div style="position:relative;width:54px;height:54px;">
      <div style="
        position:absolute;
        inset:0;
        border-radius:9999px;
        background:${colours.outerRing};
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="
          width:42px;
          height:42px;
          border-radius:9999px;
          background:${colours.background};
          color:white;
          font-weight:700;
          font-size:20px;
          line-height:1;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 6px 18px rgba(0,0,0,0.18);
          border:2px solid rgba(255,255,255,0.9);
        ">
          ${totalCount}
        </div>
      </div>

      ${
        problematicCount > 0
          ? `
        <div style="
          position:absolute;
          top:-4px;
          right:-4px;
          min-width:22px;
          height:22px;
          padding:0 6px;
          border-radius:9999px;
          background:#111827;
          color:white;
          font-size:12px;
          font-weight:700;
          display:flex;
          align-items:center;
          justify-content:center;
          border:2px solid white;
          box-shadow:0 4px 10px rgba(0,0,0,0.18);
        ">
          ${problematicCount}
        </div>
      `
          : ''
      }

      ${
        hasFull
          ? `
        <div style="
          position:absolute;
          bottom:-2px;
          right:-2px;
          width:20px;
          height:20px;
          border-radius:9999px;
          background:#7f1d1d;
          color:white;
          font-size:12px;
          font-weight:700;
          display:flex;
          align-items:center;
          justify-content:center;
          border:2px solid white;
          box-shadow:0 4px 10px rgba(0,0,0,0.18);
        ">
          !
        </div>
      `
          : ''
      }
    </div>
  `;
}

function getCachedClusterIcon(
  totalCount: number,
  problematicCount: number,
  hasFull: boolean,
  severity: 0 | 1 | 2
) {
  const cacheKey = `${totalCount}-${problematicCount}-${hasFull ? 1 : 0}-${severity}`;
  const cached = clusterIconCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const icon = L.divIcon({
    className: '',
    html: buildClusterHtml(totalCount, problematicCount, hasFull, severity),
    iconSize: [54, 54],
    iconAnchor: [27, 27],
  });

  clusterIconCache.set(cacheKey, icon);
  return icon;
}

function createClusterCustomIcon(cluster: MarkerClusterLike) {
  const childMarkers = cluster.getAllChildMarkers() as MarkerWithStationMeta[];

  let maxSeverity: 0 | 1 | 2 = 0;
  let problematicCount = 0;
  let hasFull = false;

  for (let i = 0; i < childMarkers.length; i += 1) {
    const status = childMarkers[i].options.stationStatus;
    const severity = getStatusSeverity(status);

    if (severity > 0) {
      problematicCount += 1;
    }

    if (severity === 2) {
      hasFull = true;
    }

    if (severity > maxSeverity) {
      maxSeverity = severity;

      if (maxSeverity === 2 && hasFull && problematicCount === childMarkers.length) {
        break;
      }
    }
  }

  return getCachedClusterIcon(
    cluster.getChildCount(),
    problematicCount,
    hasFull,
    maxSeverity
  );
}

function StationMarkersComponent() {
  const stationsConfig = useAtomValue(stationsConfigAtom);
  const selectedChargerId = useAtomValue(selectedChargerIdAtom);
  const setSelectedStation = useSetAtom(selectedStationAtom);
  const setSelectedChargerId = useSetAtom(selectedChargerIdAtom);

  const stationsArray = useMemo(() => Object.values(stationsConfig), [stationsConfig]);

  const handleSelect = useCallback(
    (station: StationConfig) => {
      if (selectedChargerId !== null) {
        setSelectedChargerId(null);

        window.setTimeout(() => {
          setSelectedStation({ station });
        }, 300);

        return;
      }

      setSelectedStation({ station });
    },
    [selectedChargerId, setSelectedChargerId, setSelectedStation]
  );

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={50}
      spiderfyOnMaxZoom
      showCoverageOnHover={false}
      iconCreateFunction={createClusterCustomIcon}
      removeOutsideVisibleBounds
      animate={false}
      animateAddingMarkers={false}
    >
      {stationsArray.map((station) => (
        <StationMarker
          key={station.id}
          station={station}
          onSelect={handleSelect}
        />
      ))}
    </MarkerClusterGroup>
  );
}

export const StationMarkers = React.memo(StationMarkersComponent);
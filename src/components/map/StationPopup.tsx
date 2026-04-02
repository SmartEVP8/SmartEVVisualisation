import type { Station, Charger } from '../../types/station';

type Props = {
  station: Station;
  chargers: Charger[];
};

export function StationPopup({ station, chargers }: Props) {
  return (
    <div>
      <strong>{station.address}</strong>
      <br />
      Chargers: {chargers.length}
      <br />

      {chargers.length > 0 ? (
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1rem' }}>
          {chargers.map((charger, index) => (
            <li key={charger.id}>
              Charger {index + 1}: {charger.maxPowerKW} kW{' '}
              {charger.isDual ? '(dual)' : '(single)'}
            </li>
          ))}
        </ul>
      ) : (
        <span>No chargers available</span>
      )}
    </div>
  );
}
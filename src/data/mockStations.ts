import type { Charger, Station } from '../types/station';

export const mockStations: Station[] = [
  { id: 1, address: 'Aalborg Centrum', pos: { lat: 57.0489, lon: 9.9218 } },
  { id: 2, address: 'Aalborg Vestby', pos: { lat: 57.0525, lon: 9.9080 } },
  { id: 3, address: 'Aalborg Øst', pos: { lat: 57.0370, lon: 9.9725 } },
  { id: 4, address: 'Nørresundby', pos: { lat: 57.0606, lon: 9.9225 } },

  { id: 5, address: 'Hjørring', pos: { lat: 57.4565, lon: 9.9823 } },
  { id: 6, address: 'Frederikshavn', pos: { lat: 57.4407, lon: 10.5366 } },
  { id: 7, address: 'Skagen', pos: { lat: 57.7209, lon: 10.5839 } },
  { id: 8, address: 'Brønderslev', pos: { lat: 57.2702, lon: 9.9410 } },
  { id: 9, address: 'Aars', pos: { lat: 56.8033, lon: 9.5144 } },
  { id: 10, address: 'Thisted', pos: { lat: 56.9552, lon: 8.6946 } },
  { id: 11, address: 'Nykøbing Mors', pos: { lat: 56.7938, lon: 8.8523 } },
  { id: 12, address: 'Skive', pos: { lat: 56.5661, lon: 9.0270 } },

  { id: 13, address: 'Viborg Centrum', pos: { lat: 56.4532, lon: 9.4020 } },
  { id: 14, address: 'Viborg Syd', pos: { lat: 56.4358, lon: 9.4095 } },
  { id: 15, address: 'Holstebro', pos: { lat: 56.3601, lon: 8.6161 } },
  { id: 16, address: 'Struer', pos: { lat: 56.4912, lon: 8.5938 } },
  { id: 17, address: 'Lemvig', pos: { lat: 56.5486, lon: 8.3102 } },
  { id: 18, address: 'Herning Centrum', pos: { lat: 56.1362, lon: 8.9738 } },
  { id: 19, address: 'Herning Syd', pos: { lat: 56.1238, lon: 8.9562 } },
  { id: 20, address: 'Ikast', pos: { lat: 56.1387, lon: 9.1570 } },

  { id: 21, address: 'Silkeborg Centrum', pos: { lat: 56.1697, lon: 9.5451 } },
  { id: 22, address: 'Silkeborg Nord', pos: { lat: 56.1868, lon: 9.5489 } },
  { id: 23, address: 'Horsens', pos: { lat: 55.8607, lon: 9.8503 } },
  { id: 24, address: 'Skanderborg', pos: { lat: 56.0337, lon: 9.9318 } },

  { id: 25, address: 'Aarhus C', pos: { lat: 56.1572, lon: 10.2107 } },
  { id: 26, address: 'Aarhus N', pos: { lat: 56.1787, lon: 10.1889 } },
  { id: 27, address: 'Aarhus V', pos: { lat: 56.1624, lon: 10.1601 } },
  { id: 28, address: 'Aarhus S', pos: { lat: 56.1328, lon: 10.1920 } },
  { id: 29, address: 'Egå', pos: { lat: 56.2066, lon: 10.2482 } },
  { id: 30, address: 'Risskov', pos: { lat: 56.1931, lon: 10.2344 } },

  { id: 31, address: 'Randers Centrum', pos: { lat: 56.4606, lon: 10.0364 } },
  { id: 32, address: 'Randers Syd', pos: { lat: 56.4458, lon: 10.0288 } },
  { id: 33, address: 'Grenaa', pos: { lat: 56.4158, lon: 10.8783 } },
  { id: 34, address: 'Ebeltoft', pos: { lat: 56.1944, lon: 10.6821 } },
  { id: 35, address: 'Syddjurs', pos: { lat: 56.3121, lon: 10.5145 } },

  { id: 36, address: 'Vejle', pos: { lat: 55.7093, lon: 9.5357 } },
  { id: 37, address: 'Kolding Centrum', pos: { lat: 55.4904, lon: 9.4722 } },
  { id: 38, address: 'Kolding Syd', pos: { lat: 55.4760, lon: 9.4891 } },
  { id: 39, address: 'Fredericia', pos: { lat: 55.5657, lon: 9.7526 } },
  { id: 40, address: 'Haderslev', pos: { lat: 55.2494, lon: 9.4870 } },
  { id: 41, address: 'Aabenraa', pos: { lat: 55.0443, lon: 9.4174 } },
  { id: 42, address: 'Sønderborg', pos: { lat: 54.9089, lon: 9.7898 } },
  { id: 43, address: 'Tønder', pos: { lat: 54.9387, lon: 8.8667 } },

  { id: 44, address: 'Esbjerg Centrum', pos: { lat: 55.4765, lon: 8.4594 } },
  { id: 45, address: 'Esbjerg Nord', pos: { lat: 55.4937, lon: 8.4479 } },
  { id: 46, address: 'Esbjerg Øst', pos: { lat: 55.4732, lon: 8.5031 } },
  { id: 47, address: 'Ribe', pos: { lat: 55.3305, lon: 8.7594 } },
  { id: 48, address: 'Varde', pos: { lat: 55.6211, lon: 8.4807 } },
  { id: 49, address: 'Ringkøbing', pos: { lat: 56.0907, lon: 8.2440 } },
  { id: 50, address: 'Hvide Sande', pos: { lat: 55.9981, lon: 8.1294 } },
];

const chargerCountsByStation: Record<number, number> = {
  1: 6,
  2: 4,
  3: 5,
  4: 3,
  5: 4,
  6: 6,
  7: 2,
  8: 3,
  9: 4,
  10: 5,
  11: 3,
  12: 4,
  13: 6,
  14: 3,
  15: 5,
  16: 2,
  17: 2,
  18: 7,
  19: 4,
  20: 3,
  21: 6,
  22: 4,
  23: 5,
  24: 3,
  25: 8,
  26: 6,
  27: 5,
  28: 4,
  29: 3,
  30: 4,
  31: 6,
  32: 3,
  33: 4,
  34: 3,
  35: 2,
  36: 5,
  37: 7,
  38: 4,
  39: 5,
  40: 3,
  41: 4,
  42: 4,
  43: 2,
  44: 7,
  45: 4,
  46: 5,
  47: 3,
  48: 3,
  49: 4,
  50: 2,
};

const powerOptions = [75, 100, 150, 200, 250, 300, 350];

export const mockChargers: Charger[] = mockStations.flatMap((station) => {
  const chargerCount = chargerCountsByStation[station.id];

  return Array.from({ length: chargerCount }, (_, index) => {
    const chargerId = station.id * 100 + index + 1;

    return {
      id: chargerId,
      maxPowerKW: powerOptions[(station.id + index) % powerOptions.length],
      isDual: index % 3 === 1,
      stationId: station.id,
    };
  });
});
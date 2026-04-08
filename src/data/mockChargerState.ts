// src/mocks/mockChargerStates.ts
import type { ChargerState } from '../types/chargerState';

export const mockChargerStates: ChargerState[] = [
  // --------------------------------------------------
  // Station 1 - Aalborg Centrum
  // Completely busy: every charger active and queued
  // Charger ids: 101-106
  // --------------------------------------------------
  {
    chargerId: 101,
    isActive: true,
    utilization: 0.91,
    queueSize: 3,
    activeEVId: { evID: 1000, SoC: 0.35, targetSoC: 0.9 },
    evsInQueue: [
      { evID: 1001, SoC: 0.18, targetSoC: 0.8 },
      { evID: 1002, SoC: 0.27, targetSoC: 0.85 },
      { evID: 1003, SoC: 0.34, targetSoC: 0.9 },
    ],
  },
  {
    chargerId: 102,
    isActive: true,
    utilization: 0.76,
    queueSize: 2,
    activeEVId: { evID: 1004, SoC: 0.22, targetSoC: 0.8 },
    evsInQueue: [
      { evID: 1004, SoC: 0.22, targetSoC: 0.8 },
      { evID: 1005, SoC: 0.41, targetSoC: 0.9 },
    ],
  },
  {
    chargerId: 103,
    isActive: true,
    utilization: 0.64,
    queueSize: 1,
    activeEVId: { evID: 1006, SoC: 0.29, targetSoC: 0.75 },
    evsInQueue: [{ evID: 1006, SoC: 0.29, targetSoC: 0.75 }],
  },
  {
    chargerId: 104,
    isActive: true,
    utilization: 0.88,
    queueSize: 3,
    activeEVId: { evID: 1007, SoC: 0.12, targetSoC: 0.8 },
    evsInQueue: [
      { evID: 1007, SoC: 0.12, targetSoC: 0.8 },
      { evID: 1008, SoC: 0.25, targetSoC: 0.85 },
      { evID: 1009, SoC: 0.39, targetSoC: 0.9 },
    ],
  },
  {
    chargerId: 105,
    isActive: true,
    utilization: 0.57,
    queueSize: 2,
    activeEVId: { evID: 1010, SoC: 0.31, targetSoC: 0.8 },
    evsInQueue: [
      { evID: 1010, SoC: 0.31, targetSoC: 0.8 },
      { evID: 1011, SoC: 0.48, targetSoC: 0.85 },
    ],
  },
  {
    chargerId: 106,
    isActive: true,
    utilization: 0.83,
    queueSize: 1,
    activeEVId: { evID: 1012, SoC: 0.2, targetSoC: 0.8 },
    evsInQueue: [{ evID: 1012, SoC: 0.2, targetSoC: 0.8 }],
  },

  // --------------------------------------------------
  // Station 5 - Hjørring
  // Partly busy: some in use, some free
  // Charger ids: 501-504
  // --------------------------------------------------
  {
    chargerId: 501,
    isActive: true,
    utilization: 0.72,
    queueSize: 2,
    activeEVId: { evID: 1100, SoC: 0.26, targetSoC: 0.85 },
    evsInQueue: [
      { evID: 1101, SoC: 0.24, targetSoC: 0.8 },
      { evID: 1102, SoC: 0.37, targetSoC: 0.9 },
    ],
  },
  {
    chargerId: 502,
    isActive: true,
    utilization: 0.49,
    queueSize: 1,
    activeEVId: { evID: 1103, SoC: 0.44, targetSoC: 0.8 },
    evsInQueue: [{ evID: 1103, SoC: 0.44, targetSoC: 0.8 }],
  },
  {
    chargerId: 503,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 504,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },

  // --------------------------------------------------
  // Station 13 - Viborg Centrum
  // Completely free
  // Charger ids: 1301-1306
  // --------------------------------------------------
  {
    chargerId: 1301,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 1302,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 1303,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 1304,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 1305,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 1306,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },

  // --------------------------------------------------
  // Station 18 - Herning Centrum
  // Completely busy
  // Charger ids: 1801-1807
  // --------------------------------------------------
  {
    chargerId: 1801,
    isActive: true,
    utilization: 0.94,
    queueSize: 3,
    activeEVId: { evID: 1200, SoC: 0.19, targetSoC: 0.8 },
    evsInQueue: [
      { evID: 1201, SoC: 0.14, targetSoC: 0.85 },
      { evID: 1202, SoC: 0.26, targetSoC: 0.8 },
      { evID: 1203, SoC: 0.35, targetSoC: 0.9 },
    ],
  },
  {
    chargerId: 1802,
    isActive: true,
    utilization: 0.81,
    queueSize: 2,
    activeEVId: { evID: 1204, SoC: 0.32, targetSoC: 0.8 },
    evsInQueue: [
      { evID: 1204, SoC: 0.32, targetSoC: 0.8 },
      { evID: 1205, SoC: 0.46, targetSoC: 0.85 },
    ],
  },
  {
    chargerId: 1803,
    isActive: true,
    utilization: 0.68,
    queueSize: 1,
    activeEVId: { evID: 1206, SoC: 0.28, targetSoC: 0.75 },
    evsInQueue: [{ evID: 1206, SoC: 0.28, targetSoC: 0.75 }],
  },
  {
    chargerId: 1804,
    isActive: true,
    utilization: 0.87,
    queueSize: 2,
    activeEVId: { evID: 1207, SoC: 0.23, targetSoC: 0.85 },
    evsInQueue: [
      { evID: 1207, SoC: 0.23, targetSoC: 0.85 },
      { evID: 1208, SoC: 0.38, targetSoC: 0.9 },
    ],
  },
  {
    chargerId: 1805,
    isActive: true,
    utilization: 0.79,
    queueSize: 3,
    activeEVId: { evID: 1208, SoC: 0.38, targetSoC: 0.9 },
    evsInQueue: [
      { evID: 1209, SoC: 0.11, targetSoC: 0.8 },
      { evID: 1210, SoC: 0.19, targetSoC: 0.85 },
      { evID: 1211, SoC: 0.42, targetSoC: 0.9 },
    ],
  },
  {
    chargerId: 1806,
    isActive: true,
    utilization: 0.62,
    queueSize: 1,
    activeEVId: { evID: 1211, SoC: 0.42, targetSoC: 0.9 },
    evsInQueue: [{ evID: 1212, SoC: 0.4, targetSoC: 0.8 }],
  },
  {
    chargerId: 1807,
    isActive: true,
    utilization: 0.9,
    queueSize: 2,
    activeEVId: { evID: 1212, SoC: 0.4, targetSoC: 0.8 },
    evsInQueue: [
      { evID: 1213, SoC: 0.21, targetSoC: 0.85 },
      { evID: 1214, SoC: 0.33, targetSoC: 0.9 },
    ],
  },

  // --------------------------------------------------
  // Station 25 - Aarhus C
  // Partly busy
  // Charger ids: 2501-2508
  // --------------------------------------------------
  {
    chargerId: 2501,
    isActive: true,
    utilization: 0.85,
    queueSize: 2,
    activeEVId: { evID: 1300, SoC: 0.3, targetSoC: 0.8 },
    evsInQueue: [
      { evID: 1301, SoC: 0.16, targetSoC: 0.8 },
      { evID: 1302, SoC: 0.29, targetSoC: 0.9 },
    ],
  },
  {
    chargerId: 2502,
    isActive: true,
    utilization: 0.58,
    queueSize: 1,
    activeEVId: { evID: 1303, SoC: 0.36, targetSoC: 0.8 },
    evsInQueue: [{ evID: 1303, SoC: 0.36, targetSoC: 0.8 }],
  },
  {
    chargerId: 2503,
    isActive: true,
    utilization: 0.67,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 2504,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 2505,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 2506,
    isActive: true,
    utilization: 0.71,
    queueSize: 1,
    activeEVId: { evID: 1304, SoC: 0.27, targetSoC: 0.85 },
    evsInQueue: [{ evID: 1304, SoC: 0.27, targetSoC: 0.85 }],
  },
  {
    chargerId: 2507,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 2508,
    isActive: true,
    utilization: 0.53,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },

  // --------------------------------------------------
  // Station 33 - Grenaa
  // Completely busy
  // Charger ids: 3301-3304
  // --------------------------------------------------
  {
    chargerId: 3301,
    isActive: true,
    utilization: 0.89,
    queueSize: 3,
    activeEVId: { evID: 1400, SoC: 0.18, targetSoC: 0.8 },
    evsInQueue: [
      { evID: 1401, SoC: 0.15, targetSoC: 0.8 },
      { evID: 1402, SoC: 0.28, targetSoC: 0.85 },
      { evID: 1403, SoC: 0.34, targetSoC: 0.9 },
    ],
  },
  {
    chargerId: 3302,
    isActive: true,
    utilization: 0.74,
    queueSize: 2,
    activeEVId: { evID: 1404, SoC: 0.22, targetSoC: 0.8 },
    evsInQueue: [
      { evID: 1404, SoC: 0.22, targetSoC: 0.8 },
      { evID: 1405, SoC: 0.41, targetSoC: 0.9 },
    ],
  },
  {
    chargerId: 3303,
    isActive: true,
    utilization: 0.61,
    queueSize: 1,
    activeEVId: { evID: 1406, SoC: 0.39, targetSoC: 0.8 },
    evsInQueue: [{ evID: 1406, SoC: 0.39, targetSoC: 0.8 }],
  },
  {
    chargerId: 3304,
    isActive: true,
    utilization: 0.82,
    queueSize: 2,
    activeEVId: { evID: 1407, SoC: 0.25, targetSoC: 0.85 },
    evsInQueue: [
      { evID: 1407, SoC: 0.25, targetSoC: 0.85 },
      { evID: 1408, SoC: 0.31, targetSoC: 0.9 },
    ],
  },

  // --------------------------------------------------
  // Station 44 - Esbjerg Centrum
  // Completely free
  // Charger ids: 4401-4407
  // --------------------------------------------------
  {
    chargerId: 4401,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 4402,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 4403,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 4404,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 4405,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 4406,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
  {
    chargerId: 4407,
    isActive: false,
    utilization: 0,
    queueSize: 0,
    activeEVId: null,
    evsInQueue: [],
  },
];
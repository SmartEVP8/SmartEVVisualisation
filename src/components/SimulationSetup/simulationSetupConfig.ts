import * as z from 'zod';
import type { WeightMetadata } from '../../api/types';
import type { InitEngineConfig } from '@/api/simulationRunner';

export const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
export const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

export const SIMULATION_MIN_TIME = 0;
export const SIMULATION_START_MAX_TIME = MILLISECONDS_PER_DAY * 6;
export const SIMULATION_END_MAX_TIME = MILLISECONDS_PER_DAY * 7;

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const createInitialConfig = (): InitEngineConfig => ({
    costWeights: [],
    dualChargerProbability: 0.8,
    numberOfChargers: 5000,
    processorCount: navigator.hardwareConcurrency || 1,
    maximumEVs: 50000,
    seed: 42,
    startTime: MILLISECONDS_PER_DAY,
    endTime: MILLISECONDS_PER_DAY * 6,
});

export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export function formatSliderValue(value: number) {
    return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export const simulationConfigSchema = (weightMetadata: WeightMetadata[]) =>
    z
        .object({
            maximumEVs: z.number().int().min(1).max(550000),
            seed: z.number().int().min(0),
            dualChargerProbability: z.number().min(0).max(1),
            numberOfChargers: z.number().int().min(1).max(7500),
            processorCount: z.number().int().min(1).max(navigator.hardwareConcurrency || 1),
            startTime: z.number().int().min(SIMULATION_MIN_TIME).max(SIMULATION_START_MAX_TIME),
            endTime: z.number().int().min(SIMULATION_MIN_TIME).max(SIMULATION_END_MAX_TIME),
            costWeights: z.array(
                z.object({
                    costId: z.number().int(),
                    value: z.number(),
                })
            ),
        })
        .superRefine((config, ctx) => {
            if (config.endTime <= config.startTime) {
                ctx.addIssue({
                    code: 'custom',
                    message: 'End time must be after start time',
                    path: ['endTime'],
                });
            }

            config.costWeights.forEach((weight, index) => {
                const costWeight = weightMetadata.find((cw) => cw.id === weight.costId);

                if (!costWeight) return;

                if (weight.value < costWeight.min || weight.value > costWeight.max) {
                    ctx.addIssue({
                        code: 'custom',
                        message: `${costWeight.name} must be between ${costWeight.min} and ${costWeight.max}`,
                        path: ['costWeights', index, 'value'],
                    });
                }
            });
        });
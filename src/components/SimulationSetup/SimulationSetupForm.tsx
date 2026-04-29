import * as Form from '@radix-ui/react-form';
import { Play, Loader2 } from 'lucide-react';
import { useState, useMemo, useLayoutEffect } from 'react';
import { useSetAtom } from 'jotai';
import * as z from 'zod';
import type { WeightMetadata } from '../../api/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { ConfigFormCard } from './ConfigFormCard';
import { TimePickerField } from './TimePicker';
import { startSimulation, type InitEngineConfig } from '@/api/simulationRunner';
import { getWeights } from '@/api/weights';
import { setFullWeightsAction } from '@/store/weightStore';

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

const SIMULATION_MIN_TIME = 0;
const SIMULATION_START_MAX_TIME = MILLISECONDS_PER_DAY * 6;
const SIMULATION_END_MAX_TIME = MILLISECONDS_PER_DAY * 7;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const simulationConfigSchema = (weightMetadata: WeightMetadata[]) =>
  z
    .object({
      maximumEVs: z.number().int().min(1, 'Must be at least 1').max(550000, 'Must be at most 550000'),
      seed: z.number().int().min(0, 'Must be at least 0'),
      dualChargerProbability: z.number().min(0, 'Must be at least 0').max(1, 'Must be at most 1'),
      numberOfChargers: z.number().int().min(1, 'Must be at least 1').max(7500, 'Must be at most 7500'),

      processorCount: z
        .number()
        .int()
        .min(1, 'Must be at least 1')
        .max(navigator.hardwareConcurrency || 1, `Must be at most ${navigator.hardwareConcurrency || 1}`),

      startTime: z
        .number()
        .int('Start time must be a whole number of milliseconds')
        .min(SIMULATION_MIN_TIME, 'Start time must be at least 0')
        .max(SIMULATION_START_MAX_TIME, 'Start time must be within the first 6 days'),

      endTime: z
        .number()
        .int('End time must be a whole number of milliseconds')
        .min(SIMULATION_MIN_TIME, 'End time must be at least 0')
        .max(SIMULATION_END_MAX_TIME, 'End time must be within the first 7 days'),

      costWeights: z
        .array(
          z.object({
            costId: z.number().int(),
            value: z.number(),
          })
        )
        .superRefine((costWeights, ctx) => {
          costWeights.forEach((weight, index) => {
            const costWeight = weightMetadata.find((cw) => cw.id === weight.costId);

            if (!costWeight) {
              ctx.addIssue({
                code: 'custom',
                message: `Missing weight metadata for cost ID ${weight.costId}`,
                path: [index, 'costId'],
              });
              return;
            }

            if (weight.value < costWeight.min) {
              ctx.addIssue({
                code: 'custom',
                message: `${costWeight.name} must be at least ${costWeight.min}`,
                path: [index, 'value'],
              });
            }

            if (weight.value > costWeight.max) {
              ctx.addIssue({
                code: 'custom',
                message: `${costWeight.name} must be at most ${costWeight.max}`,
                path: [index, 'value'],
              });
            }
          });
        }),
    })
    .superRefine((config, ctx) => {
      if (config.endTime <= config.startTime) {
        ctx.addIssue({
          code: 'custom',
          message: 'End time must be after start time',
          path: ['endTime'],
        });
      }
    });

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const createInitialConfig = (): InitEngineConfig => ({
  costWeights: [],
  dualChargerProbability: 0.8,
  numberOfChargers: 5000,
  processorCount: navigator.hardwareConcurrency || 1,
  maximumEVs: 50000,
  seed: 42,
  startTime: MILLISECONDS_PER_DAY,
  endTime: MILLISECONDS_PER_DAY * 7,
});

function formatSliderValue(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

type SimulationSetupFormProps = {
  closeOnSimulationStart: (close: boolean) => void;
};

export function SimulationSetupForm({ closeOnSimulationStart }: SimulationSetupFormProps) {
  const [config, setConfig] = useState<InitEngineConfig>(createInitialConfig);
  const [weightMetadata, setWeightMetadata] = useState<WeightMetadata[]>([]);
  const [isLoadingWeights, setIsLoadingWeights] = useState(true);
  const [weightsError, setWeightsError] = useState<string | null>(null);

  const setGlobalWeights = useSetAtom(setFullWeightsAction);

  useLayoutEffect(() => {
    let isMounted = true;

    getWeights()
      .then((res) => {
        if (!isMounted) return;

        setWeightMetadata(res);
        setConfig((prev) => ({
          ...prev,
          costWeights: res.map((w) => ({ costId: w.id, value: w.min })),
        }));
      })
      .catch((err) => {
        if (isMounted) setWeightsError(err instanceof Error ? err.message : 'Failed to fetch weights');
      })
      .finally(() => {
        if (isMounted) setIsLoadingWeights(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const schema = useMemo(() => simulationConfigSchema(weightMetadata), [weightMetadata]);

  const handleStart = () => {
    try {
      schema.parse(config);

      startSimulation(config)
        .then(() => {
          const fullWeightsToStore = weightMetadata.map((meta) => {
            const currentVal = config.costWeights.find((cw) => cw.costId === meta.id)?.value ?? meta.min;
            return { ...meta, value: currentVal };
          });

          setGlobalWeights(fullWeightsToStore);
          closeOnSimulationStart(true);
        })
        .catch((error) => {
          console.error('Failed to initialize simulation:', error);
        });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.issues);
      }
    }
  };

  return (
    <ConfigFormCard title="Setup Configuration" className="w-full max-w-[1100px]">
      <Form.Root
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          handleStart();
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-border/60 bg-background/35 p-5">
            <h2 className="mb-5 text-xl font-semibold">Simulation Config</h2>

            <div className="grid gap-4">
              <Form.Field name="maximumEVs" className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4">
                <Form.Label asChild>
                  <Label className="text-sm font-semibold">Number of EVs</Label>
                </Form.Label>
                <Form.Control asChild>
                  <Input
                    type="number"
                    value={config.maximumEVs}
                    onFocus={(e) => {
                      if (e.currentTarget.value === config.maximumEVs.toString()) {
                        e.currentTarget.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      const raw = e.currentTarget.value.trim();

                      if (raw === '') {
                        setConfig((prev) => ({
                          ...prev,
                          maximumEVs: createInitialConfig().maximumEVs,
                        }));
                        return;
                      }

                      const parsedValue = Number(raw);
                      if (Number.isNaN(parsedValue)) return;

                      setConfig((prev) => ({
                        ...prev,
                        maximumEVs: clamp(parsedValue, 1, 550000),
                      }));
                    }}
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        maximumEVs: Number(event.target.value),
                      }))
                    }
                    className="h-11 rounded-2xl border-border/80 bg-background/80 px-4 text-center text-sm font-semibold tabular-nums"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="seed" className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4">
                <Form.Label asChild>
                  <Label className="text-sm font-semibold">Seed</Label>
                </Form.Label>
                <Form.Control asChild>
                  <Input
                    type="number"
                    value={config.seed}
                    onFocus={(e) => {
                      if (e.currentTarget.value === config.seed.toString()) {
                        e.currentTarget.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      const raw = e.currentTarget.value.trim();

                      if (raw === '') {
                        setConfig((prev) => ({
                          ...prev,
                          seed: createInitialConfig().seed,
                        }));
                        return;
                      }

                      const parsedValue = Number(raw);
                      if (Number.isNaN(parsedValue)) return;

                      setConfig((prev) => ({
                        ...prev,
                        seed: Math.max(0, parsedValue),
                      }));
                    }}
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        seed: Number(event.target.value),
                      }))
                    }
                    className="h-11 rounded-2xl border-border/80 bg-background/80 px-4 text-center text-sm font-semibold tabular-nums"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="numberOfChargers" className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4">
                <Form.Label asChild>
                  <Label className="text-sm font-semibold">Chargers</Label>
                </Form.Label>
                <Form.Control asChild>
                  <Input
                    type="number"
                    value={config.numberOfChargers}
                    onFocus={(e) => {
                      if (e.currentTarget.value === config.numberOfChargers.toString()) {
                        e.currentTarget.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      const raw = e.currentTarget.value.trim();

                      if (raw === '') {
                        setConfig((prev) => ({
                          ...prev,
                          numberOfChargers: createInitialConfig().numberOfChargers,
                        }));
                        return;
                      }

                      const parsedValue = Number(raw);
                      if (Number.isNaN(parsedValue)) return;

                      setConfig((prev) => ({
                        ...prev,
                        numberOfChargers: clamp(parsedValue, 1, 7500),
                      }));
                    }}
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        numberOfChargers: Number(event.target.value),
                      }))
                    }
                    className="h-11 rounded-2xl border-border/80 bg-background/80 px-4 text-center text-sm font-semibold tabular-nums"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="processorCount" className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4">
                <Form.Label asChild>
                  <Label className="text-sm font-semibold">Processors</Label>
                </Form.Label>
                <Form.Control asChild>
                  <Input
                    type="number"
                    min={1}
                    max={navigator.hardwareConcurrency || 1}
                    value={config.processorCount}
                    onFocus={(e) => {
                      if (e.currentTarget.value === config.processorCount.toString()) {
                        e.currentTarget.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      const raw = e.currentTarget.value.trim();

                      if (raw === '') {
                        setConfig((prev) => ({
                          ...prev,
                          processorCount: createInitialConfig().processorCount,
                        }));
                        return;
                      }

                      const parsedValue = Number(raw);
                      if (Number.isNaN(parsedValue)) return;

                      setConfig((prev) => ({
                        ...prev,
                        processorCount: clamp(parsedValue, 1, navigator.hardwareConcurrency || 1),
                      }));
                    }}
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        processorCount: clamp(Number(event.target.value), 1, navigator.hardwareConcurrency || 1),
                      }))
                    }
                    className="h-11 rounded-2xl border-border/80 bg-background/80 px-4 text-center text-sm font-semibold tabular-nums"
                  />
                </Form.Control>
              </Form.Field>

              <Form.Field name="dualChargingProbability" className="grid gap-2">
                <Form.Label asChild>
                  <Label className="text-sm font-semibold">Probability of Dual Charger</Label>
                </Form.Label>

                <div className="grid grid-cols-[24px_minmax(0,1fr)_32px_80px] items-center gap-3">
                  <span className="text-sm font-medium text-neutral-400">0</span>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[config.dualChargerProbability]}
                    onValueChange={(values) =>
                      setConfig((prev) => ({
                        ...prev,
                        dualChargerProbability: values[0] ?? 0,
                      }))
                    }
                    className="h-5"
                  />
                  <span className="text-right text-sm font-medium text-neutral-400">1</span>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={formatSliderValue(config.dualChargerProbability)}
                    onFocus={(e) => {
                      if (e.currentTarget.value === formatSliderValue(config.dualChargerProbability)) {
                        e.currentTarget.value = '';
                      }
                    }}
                    onBlur={(e) => {
                      const raw = e.currentTarget.value.trim();

                      if (raw === '') {
                        setConfig((prev) => ({
                          ...prev,
                          dualChargerProbability: createInitialConfig().dualChargerProbability,
                        }));
                        return;
                      }

                      const parsedValue = Number(raw);
                      if (Number.isNaN(parsedValue)) return;

                      setConfig((prev) => ({
                        ...prev,
                        dualChargerProbability: clamp(parsedValue, 0, 1),
                      }));
                    }}
                    onChange={(event) => {
                      const rawValue = event.target.value;
                      if (!/^\d*\.?\d*$/.test(rawValue)) return;

                      const parsedValue = Number(rawValue);
                      if (Number.isNaN(parsedValue)) return;

                      setConfig((prev) => ({
                        ...prev,
                        dualChargerProbability: clamp(parsedValue, 0, 1),
                      }));
                    }}
                    className="h-10 w-[80px] rounded-full border-border/80 bg-background/80 px-2 text-center text-sm font-semibold tabular-nums"
                  />
                </div>
              </Form.Field>
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-background/35 p-5">
            <h2 className="mb-5 text-xl font-semibold">Simulation Time Window</h2>

            <div className="grid gap-5">
              <TimePickerField
                name="startTime"
                label="Start Time"
                value={config.startTime}
                minTime={SIMULATION_MIN_TIME}
                maxTime={SIMULATION_START_MAX_TIME}
                dayOptions={DAYS.slice(0, 7)}
                onChange={(startTime) =>
                  setConfig((prev) => ({
                    ...prev,
                    startTime,
                  }))
                }
              />

              <TimePickerField
                name="endTime"
                label="End Time"
                value={config.endTime}
                minTime={SIMULATION_MIN_TIME}
                maxTime={SIMULATION_END_MAX_TIME}
                dayOptions={DAYS}
                formatDayLabel={(day, index) => (index === 7 ? 'Next Sunday' : day)}
                onChange={(endTime) =>
                  setConfig((prev) => ({
                    ...prev,
                    endTime,
                  }))
                }
              />
            </div>
          </section>
        </div>

        <div className="flex justify-center">
          <section className="w-full max-w-[820px] rounded-3xl border border-border/60 bg-background/35 p-5">
            <div className="mb-5 flex items-center gap-4 text-xl font-semibold">
              Weights
              {isLoadingWeights && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            </div>

            {weightsError ? (
              <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
                Failed to load weights: {weightsError}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {weightMetadata.map((weight) => {
                  const value = config.costWeights.find((item) => item.costId === weight.id)?.value ?? weight.min;

                  return (
                    <Form.Field key={weight.id} name={`weight-${weight.id}`} className="grid gap-2">
                      <Form.Label asChild>
                        <Label className="text-sm font-semibold">{weight.name}</Label>
                      </Form.Label>

                      <div className="grid grid-cols-[32px_minmax(0,1fr)_44px_80px] items-center gap-3">
                        <span className="text-sm font-medium text-neutral-400">{weight.min}</span>

                        <Slider
                          min={weight.min}
                          max={weight.max}
                          step={0.1}
                          value={[value]}
                          onValueChange={(values) =>
                            setConfig((prev) => ({
                              ...prev,
                              costWeights: prev.costWeights.map((item) =>
                                item.costId === weight.id ? { ...item, value: values[0] ?? weight.min } : item
                              ),
                            }))
                          }
                          className="h-5"
                          aria-label={weight.name}
                        />

                        <span className="text-right text-sm font-medium text-neutral-400">{weight.max}</span>

                        <Input
                          type="number"
                          min={weight.min}
                          max={weight.max}
                          step={0.1}
                          value={formatSliderValue(value)}
                          onFocus={(e) => {
                            if (e.currentTarget.value === formatSliderValue(value)) {
                              e.currentTarget.value = '';
                            }
                          }}
                          onBlur={(e) => {
                            const raw = e.currentTarget.value.trim();

                            if (raw === '') {
                              setConfig((prev) => ({
                                ...prev,
                                costWeights: prev.costWeights.map((item) =>
                                  item.costId === weight.id ? { ...item, value: weight.min } : item
                                ),
                              }));
                              return;
                            }

                            const parsedValue = Number(raw);
                            if (Number.isNaN(parsedValue)) return;

                            setConfig((prev) => ({
                              ...prev,
                              costWeights: prev.costWeights.map((item) =>
                                item.costId === weight.id
                                  ? {
                                    ...item,
                                    value: clamp(parsedValue, weight.min, weight.max),
                                  }
                                  : item
                              ),
                            }));
                          }}
                          onChange={(event) => {
                            const rawValue = event.target.value;
                            if (!/^\d*\.?\d*$/.test(rawValue)) return;

                            const nextValue = Number(rawValue);
                            if (Number.isNaN(nextValue)) return;

                            setConfig((prev) => ({
                              ...prev,
                              costWeights: prev.costWeights.map((item) =>
                                item.costId === weight.id
                                  ? {
                                    ...item,
                                    value: clamp(nextValue, weight.min, weight.max),
                                  }
                                  : item
                              ),
                            }));
                          }}
                          className="h-10 w-[80px] rounded-full border border-border/60 bg-background/70 px-3 text-center text-sm font-semibold tabular-nums"
                        />
                      </div>
                    </Form.Field>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Form.Submit asChild>
            <Button
              type="submit"
              size="lg"
              className="gap-2 rounded-xl"
              disabled={isLoadingWeights || weightsError !== null || weightMetadata.length === 0}
            >
              <Play className="h-5 w-5 transition group-hover/button:scale-110" />
              Start Simulation
            </Button>
          </Form.Submit>

          <Button
            type="button"
            onClick={() => closeOnSimulationStart(true)}
            variant="outline"
            size="lg"
            className="rounded-full px-5 text-lg"
          >
            Close
          </Button>
        </div>
      </Form.Root>
    </ConfigFormCard>
  );
}
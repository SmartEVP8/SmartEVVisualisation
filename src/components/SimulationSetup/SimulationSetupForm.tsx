import * as Form from '@radix-ui/react-form';
import { Play } from 'lucide-react';
import { useState } from 'react';
import * as z from 'zod';
import { initializeSimulation } from '../../api/init';
import type { InitEngineConfig, WeightMetadata } from '../../api/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { ConfigFormCard } from './ConfigFormCard';

type SimulationSetupFormProps = {
  onClose: () => void;
  weightMetadata: WeightMetadata[];
  initialCostWeights: InitEngineConfig['costWeights'];
  onStart?: (config: InitEngineConfig) => void;
};

const simulationConfigSchema = (weightMetadata: WeightMetadata[]) => 
  z.object({
  maximumEVs: z.number().min(1, 'Must be at least 1').max(550000, 'Must be at most 550000'),
  seed: z.number().min(0, 'Must be at least 0'),
  dualChargingProbability: z
    .number()
    .min(0, 'Must be at least 0')
    .max(1, 'Must be at most 1'),
  numberOfChargers: z.number().min(1, 'Must be at least 1').max(7500, 'Must be at most 2500'),
  costWeights: z.array(
    z.object({
      costId: z.number(),
      value: z.number(),
    })
  ).superRefine((costWeights, ctx) => {
    costWeights.forEach((weight, index) => {
      const costWeight = weightMetadata.find((cw) => cw.id === weight.costId);

      if (!costWeight) {
        ctx.addIssue({
          expected: 'valid costId',
          code: 'invalid_type',
          message: `Missing weight for cost ID ${weight.costId}`,
          path: [index, "costId"],
        });
        return;
      }

      if (weight.value < costWeight.min) {
        ctx.addIssue({
          expected: 'number greater than or equal to ' + costWeight.min,
          code: 'custom',
          message: `Weight value for cost ID ${weight.costId} must be at least ${costWeight.min}`,
          path: ['costWeights', index, "value"],
        });
      }

      if (weight.value > costWeight.max) {
        ctx.addIssue({
          expected: 'number less than or equal to ' + costWeight.max,
          code: 'custom',
          message: `Weight value for cost ID ${weight.costId} must be at most ${costWeight.max}`,
          path: ['costWeights', index, "value"],
        });
      }
    });
  }),
});

const createInitialConfig = (
  initialCostWeights: InitEngineConfig['costWeights']
): InitEngineConfig => ({
  costWeights: initialCostWeights,
  dualChargingProbability: 0.8,
  numberOfChargers: 5000,
  maximumEVs: 500000,
  seed: 42,
});

function formatSliderValue(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export function SimulationSetupForm({
  onClose,
  weightMetadata,
  initialCostWeights,
  onStart,
}: SimulationSetupFormProps) {
  const [config, setConfig] = useState<InitEngineConfig>(() =>
    createInitialConfig(initialCostWeights)
  );

  const schema = simulationConfigSchema(weightMetadata);

  const handleStart = () => {
    console.log('Initializing simulation with config:', config);
    schema.parse(config);
    initializeSimulation(config)
      .then((response) => {
        console.log('Simulation initialized with response:', response);
        onStart?.(config);
      })
      .catch((error) => {
        if (error instanceof z.ZodError){
          console.error('Validation errors:', error.issues);
        }
        console.error('Failed to initialize simulation:', error);
      });
  };

  return (
    <ConfigFormCard title="Setup Configuration" className="w-full max-w-[640px]">
      <Form.Root
        className="flex flex-col gap-8"
        onSubmit={(event) => {
          event.preventDefault();
          handleStart();
        }}
      >
        <div className="flex flex-col gap-5">
          <Form.Field
            name="maximumEVs"
            className="grid grid-cols-1 gap-2 md:grid-cols-[190px_minmax(0,1fr)] md:gap-6"
          >
            <Form.Label asChild>
              <Label className="pt-2 text-base leading-snug font-semibold">
                Number of EVs
              </Label>
            </Form.Label>

            <Form.Control asChild>
              <Input
                type="number"
                value={config.maximumEVs}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    maximumEVs: Number(event.target.value),
                  }))
                }
                className="h-12 w-full max-w-[280px] rounded-2xl border-border/80 bg-background/80 px-4 text-base"
              />
            </Form.Control>
          </Form.Field>

          <Form.Field
            name="seed"
            className="grid grid-cols-1 gap-2 md:grid-cols-[190px_minmax(0,1fr)] md:gap-6"
          >
            <Form.Label asChild>
              <Label className="pt-2 text-base leading-snug font-semibold">
                Seed
              </Label>
            </Form.Label>

            <Form.Control asChild>
              <Input
                type="number"
                value={config.seed}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    seed: Number(event.target.value),
                  }))
                }
                className="h-12 w-full max-w-[280px] rounded-2xl border-border/80 bg-background/80 px-4 text-base"
              />
            </Form.Control>
          </Form.Field>

          <Form.Field
            name="dualChargingProbability"
            className="grid grid-cols-1 gap-2 md:grid-cols-[190px_minmax(0,1fr)] md:gap-6"
          >
            <Form.Label asChild>
              <Label className="pt-1 text-base leading-snug font-semibold">
                Probability of Dual Charger
              </Label>
            </Form.Label>

            <div className="w-full max-w-[420px]">
              <div className="grid grid-cols-[32px_minmax(0,1fr)_44px_64px] items-center gap-3">
                <span className="text-sm font-medium text-neutral-400">0</span>

                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[config.dualChargingProbability]}
                  onValueChange={(values) =>
                    setConfig((prev) => ({
                      ...prev,
                      dualChargingProbability: values[0] ?? 0,
                    }))
                  }
                  className="h-5"
                  aria-label="Probability of Dual Charger"
                />

                <span className="text-right text-sm font-medium text-neutral-400">
                  1
                </span>

                <div className="rounded-xl border border-border/80 bg-background/80 px-3 py-1.5 text-right text-sm font-semibold">
                  {formatSliderValue(config.dualChargingProbability)}
                </div>
              </div>
            </div>
          </Form.Field>

          <Form.Field
            name="numberOfChargers"
            className="grid grid-cols-1 gap-2 md:grid-cols-[190px_minmax(0,1fr)] md:gap-6"
          >
            <Form.Label asChild>
              <Label className="pt-2 text-base leading-snug font-semibold">
                Number of Chargers
              </Label>
            </Form.Label>

            <Form.Control asChild>
              <Input
                type="number"
                value={config.numberOfChargers}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    numberOfChargers: Number(event.target.value),
                  }))
                }
                className="h-12 w-full max-w-[280px] rounded-2xl border-border/80 bg-background/80 px-4 text-base"
              />
            </Form.Control>
          </Form.Field>
        </div>

        <div className="border-t border-border/70 pt-6">
          <div className="mb-5 text-2xl font-semibold">
            Weights
          </div>

          <div className="flex flex-col gap-5">
            {weightMetadata.map((weight) => {
              const value =
                config.costWeights.find((item) => item.costId === weight.id)
                  ?.value ?? weight.min;

              return (
                <Form.Field
                  key={weight.id}
                  name={`weight-${weight.id}`}
                  className="grid grid-cols-1 gap-2 md:grid-cols-[190px_minmax(0,1fr)] md:gap-6"
                >
                  <Form.Label asChild>
                    <Label className="pt-1 text-base leading-snug font-semibold">
                      {weight.name}
                    </Label>
                  </Form.Label>

                  <div className="w-full max-w-[420px]">
                    <div className="grid grid-cols-[32px_minmax(0,1fr)_44px_64px] items-center gap-3">
                      <span className="text-sm font-medium text-neutral-400">
                        {weight.min}
                      </span>

                      <Slider
                        min={weight.min}
                        max={weight.max}
                        step={0.1}
                        value={[value]}
                        onValueChange={(values) =>
                          setConfig((prev) => ({
                            ...prev,
                            costWeights: prev.costWeights.map((item) =>
                              item.costId === weight.id
                                ? { ...item, value: values[0] ?? weight.min }
                                : item
                            ),
                          }))
                        }
                        className="h-5"
                        aria-label={weight.name}
                      />

                      <span className="text-right text-sm font-medium text-neutral-400">
                        {weight.max}
                      </span>

                      <div className="rounded-xl border border-border/80 bg-background/80 px-3 py-1.5 text-right text-sm font-semibold">
                        {formatSliderValue(value)}
                      </div>
                    </div>
                  </div>
                </Form.Field>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Form.Submit asChild>
            <Button
              type="submit"
              size="lg"
              className="gap-2 rounded-xl"
            >
              <Play className="h-5 w-5 transition group-hover/button:scale-110" />
              Start Simulation
            </Button>
          </Form.Submit>

          <Button
            type="button"
            onClick={onClose}
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
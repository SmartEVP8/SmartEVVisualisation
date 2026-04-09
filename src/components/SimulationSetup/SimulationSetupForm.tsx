import { useState } from 'react';
import * as Form from '@radix-ui/react-form';
import * as z from 'zod';
import { ConfigFormCard } from './ConfigFormCard';
import { NumberField } from '../UI/NumberField';
import { SliderField } from '../UI/SliderField';
import type { WeightMetadata, InitEngineConfig } from '../../api/types';
import { initializeSimulation } from '../../api/init';

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
          <NumberField
            name="maximumEVs"
            label="Number of EVs"
            value={config.maximumEVs}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                maximumEVs: value,
              }))
            }
          />

          <NumberField
            name="seed"
            label="Seed"
            value={config.seed}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                seed: value,
              }))
            }
          />

          <SliderField
            name="dualChargingProbability"
            label="Probability of Dual Charger"
            value={config.dualChargingProbability}
            min={0}
            max={1}
            step={0.1}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                dualChargingProbability: value,
              }))
            }
          />

          <NumberField
            name="numberOfChargers"
            label="Number of Chargers"
            value={config.numberOfChargers}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                numberOfChargers: value,
              }))
            }
          />
        </div>

        <div className="border-t border-neutral-800 pt-6">
          <div className="mb-5 text-2xl font-semibold text-neutral-100">
            Weights
          </div>

          <div className="flex flex-col gap-5">
            {weightMetadata.map((weight) => {
              const value =
                config.costWeights.find((item) => item.costId === weight.id)
                  ?.value ?? weight.min;

              return (
                <SliderField
                  key={weight.id}
                  name={`weight-${weight.id}`}
                  label={weight.name}
                  value={value}
                  min={weight.min}
                  max={weight.max}
                  step={0.1}
                  onChange={(newValue) =>
                    setConfig((prev) => ({
                      ...prev,
                      costWeights: prev.costWeights.map((item) =>
                        item.costId === weight.id
                          ? { ...item, value: newValue }
                          : item
                      ),
                    }))
                  }
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Form.Submit asChild>
            <button
              type="submit"
              className="
                group
                flex h-12 w-12 items-center justify-center
                rounded-xl
                border border-neutral-600
                bg-neutral-800
                text-white
                shadow-md
                transition
                hover:scale-105 hover:bg-neutral-700
              "
              aria-label="Start simulation"
            >
              <svg
                viewBox="0 0 15 15"
                className="h-5 w-5 text-white transition group-hover:scale-110"
              >
                <path
                  d="M3.24182 2.32181C3.3919 2.23132 3.5784 2.22601 3.73338 2.30781L12.7334 7.05781C12.8974 7.14436 13 7.31457 13 7.5C13 7.68543 12.8974 7.85564 12.7334 7.94219L3.73338 12.6922C3.5784 12.774 3.3919 12.7687 3.24182 12.6782C3.09175 12.5877 3 12.4252 3 12.25V2.75C3 2.57476 3.09175 2.4123 3.24182 2.32181ZM4 3.57925V11.4207L11.4288 7.5L4 3.57925Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </Form.Submit>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-full
              border border-neutral-600
              bg-neutral-800
              px-5 py-3
              text-lg font-medium text-white
              transition hover:bg-neutral-700
            "
          >
            Close
          </button>
        </div>
      </Form.Root>
    </ConfigFormCard>
  );
}
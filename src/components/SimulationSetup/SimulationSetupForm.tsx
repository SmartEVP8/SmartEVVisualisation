import { useState } from 'react';
import * as Form from '@radix-ui/react-form';
import { ConfigFormCard } from './ConfigFormCard';
import { NumberField } from '../UI/NumberField';
import { SliderField } from '../UI/SliderField';
import type { WeightMetadata } from '../../api/types';
import type { InitRequest } from '../../types/simulationConfig';

type SimulationSetupFormProps = {
  onClose: () => void;
  weightMetadata: WeightMetadata[];
  initialCostWeights: InitRequest['costWeights'];
  onStart?: (config: InitRequest) => void;
};

const createInitialConfig = (
  initialCostWeights: InitRequest['costWeights']
): InitRequest => ({
  costWeights: initialCostWeights,
  stationGenerationOptions: {
    dualChargingProbability: 0.8,
    numberOfChargers: 2400,
  },
  maximumNumberOfEVs: 500000,
  seed: 42,
});

export function SimulationSetupForm({
  onClose,
  weightMetadata,
  initialCostWeights,
  onStart,
}: SimulationSetupFormProps) {
  const [config, setConfig] = useState<InitRequest>(() =>
    createInitialConfig(initialCostWeights)
  );

  const handleStart = () => {
    console.log("Starting simulation with config:", config);
    onStart?.(config);
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
            name="maximumNumberOfEVs"
            label="Number of EVs"
            value={config.maximumNumberOfEVs}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                maximumNumberOfEVs: value,
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
            value={config.stationGenerationOptions.dualChargingProbability}
            min={0}
            max={1}
            step={0.1}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                stationGenerationOptions: {
                  ...prev.stationGenerationOptions,
                  dualChargingProbability: value,
                },
              }))
            }
          />

          <NumberField
            name="numberOfChargers"
            label="Number of Chargers"
            value={config.stationGenerationOptions.numberOfChargers}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                stationGenerationOptions: {
                  ...prev.stationGenerationOptions,
                  numberOfChargers: value,
                },
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
                config.costWeights.find((item) => item.id === weight.id)
                  ?.updatedValue ?? weight.min;

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
                        item.id === weight.id
                          ? { ...item, updatedValue: newValue }
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
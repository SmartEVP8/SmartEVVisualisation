import { useState } from 'react';
import { ConfigFormCard } from './ConfigFormCard';
import { ConfigField } from './ConfigField';
import type { InitRequest } from '../../types/simulationConfig';

type SimulationSetupFormProps = {
  onClose: () => void;
};

const initialConfig: InitRequest = {
  costWeights: [
    { id: 1, updatedValue: 3 },
    { id: 2, updatedValue: 6 },
  ],
  stationGenerationOptions: {
    dualChargingProbability: 0.4,
    numberOfChargers: 12,
  },
  maximumNumberOfEVs: 100,
  seed: 42,
};

export function SimulationSetupForm({
  onClose,
}: SimulationSetupFormProps) {
  const [config, setConfig] = useState<InitRequest>(initialConfig);

  const setMaximumNumberOfEVs = (value: number) => {
    setConfig((prev) => ({
      ...prev,
      maximumNumberOfEVs: value,
    }));
  };

  const setSeed = (value: number) => {
    setConfig((prev) => ({
      ...prev,
      seed: value,
    }));
  };

  const setDualChargingProbability = (value: number) => {
    setConfig((prev) => ({
      ...prev,
      stationGenerationOptions: {
        ...prev.stationGenerationOptions,
        dualChargingProbability: value,
      },
    }));
  };

  const setNumberOfChargers = (value: number) => {
    setConfig((prev) => ({
      ...prev,
      stationGenerationOptions: {
        ...prev.stationGenerationOptions,
        numberOfChargers: value,
      },
    }));
  };

  const setCostWeight = (id: number, value: number) => {
    setConfig((prev) => ({
      ...prev,
      costWeights: prev.costWeights.map((weight) =>
        weight.id === id ? { ...weight, updatedValue: value } : weight
      ),
    }));
  };

  const getCostWeight = (id: number) =>
    config.costWeights.find((weight) => weight.id === id)?.updatedValue ?? 0;

  const handleStart = () => {
    console.log(config);
  };

  return (
    <ConfigFormCard title="Setup Configuration" className="max-w-5xl">
      <div className="flex flex-col gap-10">
        <ConfigField
          variant="input"
          label="Number of EVs"
          value={config.maximumNumberOfEVs}
          onChange={setMaximumNumberOfEVs}
        />

        <ConfigField
          variant="input"
          label="Seed"
          value={config.seed}
          onChange={setSeed}
        />

        <ConfigField
          variant="slider"
          label="Probability of Dual Charger"
          value={config.stationGenerationOptions.dualChargingProbability}
          onChange={setDualChargingProbability}
          min={0}
          max={1}
          step={0.1}
        />

        <ConfigField
          variant="input"
          label="Number of Chargers"
          value={config.stationGenerationOptions.numberOfChargers}
          onChange={setNumberOfChargers}
        />

        <div className="flex flex-col gap-4">
          <div className="text-2xl font-semibold text-neutral-100">
            Weights:
          </div>

          <ConfigField
            variant="slider"
            label="Price Sensitivity"
            value={getCostWeight(1)}
            onChange={(value) => setCostWeight(1, value)}
            min={0}
            max={10}
            step={1}
          />

          <ConfigField
            variant="slider"
            label="Urgency"
            value={getCostWeight(2)}
            onChange={(value) => setCostWeight(2, value)}
            min={0}
            max={10}
            step={1}
          />
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={handleStart}
            className="
              flex h-20 w-20 items-center justify-center
              rounded-[1.75rem]
              border border-neutral-600
              bg-neutral-800
              text-3xl text-white
              shadow-lg
              transition hover:bg-neutral-700
            "
            aria-label="Start simulation"
          >
            ▶
          </button>

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
      </div>
    </ConfigFormCard>
  );
}
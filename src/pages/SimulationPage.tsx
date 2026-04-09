import { useState } from 'react';
import { MapView } from '../components/map/MapView';
import { getWeights } from '../api/weights';
import type { WeightMetadata } from '../api/types';
import type { InitRequest } from '../types/simulationConfig';
import { StartSimulationButton } from '../components/SimulationSetup/StartSimulationButton';
import { SimulationSetupForm } from '../components/SimulationSetup/SimulationSetupForm';

async function initializeWeights(): Promise<{
  weightMetadata: WeightMetadata[];
  costWeights: InitRequest['costWeights'];
}> {
  const weights = await getWeights();

  return {
    weightMetadata: weights,
    costWeights: weights.map((weight) => ({
      id: weight.id,
      updatedValue: weight.min,
    })),
  };
}

export function SimulationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingWeights, setIsLoadingWeights] = useState(false);
  const [weightsError, setWeightsError] = useState<string | null>(null);
  const [weightMetadata, setWeightMetadata] = useState<WeightMetadata[]>([]);
  const [initialCostWeights, setInitialCostWeights] = useState<
    InitRequest['costWeights']
  >([]);

  const handleOpen = async () => {
    try {
      setIsLoadingWeights(true);
      setWeightsError(null);

      const { weightMetadata, costWeights } = await initializeWeights();

      setWeightMetadata(weightMetadata);
      setInitialCostWeights(costWeights);
      setIsOpen(true);
    } catch (error) {
      setWeightsError(
        error instanceof Error ? error.message : 'Failed to load weights'
      );
    } finally {
      setIsLoadingWeights(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleStartSimulation = (config: InitRequest) => {
    console.log('Start simulation with config:', config);
  };

  return (
    <div className="relative h-screen w-screen bg-slate-950 text-white">
      <MapView />

      <div className="absolute left-4 top-4 z-[1000] w-[280px]">
        <StartSimulationButton
          onOpen={handleOpen}
          disabled={isLoadingWeights}
        />

        {weightsError && !isOpen && (
          <div className="mt-3 text-sm text-red-400">{weightsError}</div>
        )}
      </div>

      {isOpen && (
        <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <SimulationSetupForm
            onClose={handleClose}
            weightMetadata={weightMetadata}
            initialCostWeights={initialCostWeights}
            onStart={handleStartSimulation}
          />
        </div>
      )}
    </div>
  );
}
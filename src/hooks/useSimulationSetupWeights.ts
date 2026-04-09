import { useState } from 'react';
import { getWeights } from '../api/weights';
import type { WeightMetadata, InitEngineConfig } from '../api/types';

async function initializeWeights(): Promise<{
  weightMetadata: WeightMetadata[];
  costWeights: InitEngineConfig['costWeights'];
}> {
  const weights = await getWeights();

  return {
    weightMetadata: weights,
    costWeights: weights.map((weight) => ({
      costId: weight.id,
      value: weight.min,
    })),
  };
}

export function useSimulationSetupWeights(isSimulationStarting: boolean) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingWeights, setIsLoadingWeights] = useState(false);
  const [weightsError, setWeightsError] = useState<string | null>(null);
  const [weightMetadata, setWeightMetadata] = useState<WeightMetadata[]>([]);
  const [initialCostWeights, setInitialCostWeights] = useState<
    InitEngineConfig['costWeights']
  >([]);

  const open = async () => {
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

  const close = () => {
    if (isSimulationStarting) {
      return;
    }

    setIsOpen(false);
  };

  return {
    isOpen,
    isLoadingWeights,
    weightsError,
    weightMetadata,
    initialCostWeights,
    open,
    close,
    setIsOpen,
  };
}
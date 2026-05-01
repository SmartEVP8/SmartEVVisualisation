import * as Form from '@radix-ui/react-form';
import { Play } from 'lucide-react';
import { useState, useMemo, useLayoutEffect } from 'react';
import { useSetAtom } from 'jotai';
import * as z from 'zod';
import type { WeightMetadata } from '../../api/types';
import { Button } from '../ui/button';
import { ConfigFormCard } from './ConfigFormCard';
import { startSimulation, type InitEngineConfig } from '@/api/simulationRunner';
import { getWeights } from '@/api/weights';
import { setFullWeightsAction } from '@/store/weightStore';
import { SimulationConfigSection } from './SimulationConfigSection';
import { SimulationTimeWindowSection } from './SimulationTimeWindowSection';
import { WeightsSection } from './WeightsSection';
import { createInitialConfig, simulationConfigSchema } from './simulationSetupConfig';

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
    <ConfigFormCard
      title="Setup Configuration"
      className="w-full max-w-[1100px] max-h-[calc(100vh-12px)]"
    >
      <Form.Root
        className="-mt-6 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          handleStart();
        }}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <SimulationConfigSection config={config} setConfig={setConfig} />
          <SimulationTimeWindowSection config={config} setConfig={setConfig} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <WeightsSection
            config={config}
            setConfig={setConfig}
            weightMetadata={weightMetadata}
            isLoadingWeights={isLoadingWeights}
            weightsError={weightsError}
          />
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
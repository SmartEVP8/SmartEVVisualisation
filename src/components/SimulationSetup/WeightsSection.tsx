import type { Dispatch, SetStateAction } from 'react';
import * as Form from '@radix-ui/react-form';
import { Loader2 } from 'lucide-react';
import type { WeightMetadata } from '../../api/types';
import type { InitEngineConfig } from '@/api/simulationRunner';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { clamp, formatSliderValue } from './simulationSetupConfig';

type Props = {
    config: InitEngineConfig;
    setConfig: Dispatch<SetStateAction<InitEngineConfig>>;
    weightMetadata: WeightMetadata[];
    isLoadingWeights: boolean;
    weightsError: string | null;
};

export function WeightsSection({ config, setConfig, weightMetadata, isLoadingWeights, weightsError }: Props) {
    return (
        <section className="rounded-3xl border border-border/60 bg-background/35 p-5">
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
                                            if (e.currentTarget.value === formatSliderValue(value)) e.currentTarget.value = '';
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
                                                        ? { ...item, value: clamp(parsedValue, weight.min, weight.max) }
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
                                                        ? { ...item, value: clamp(nextValue, weight.min, weight.max) }
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
    );
}
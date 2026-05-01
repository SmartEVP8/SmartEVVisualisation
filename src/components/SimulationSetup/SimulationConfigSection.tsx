import type { Dispatch, SetStateAction } from 'react';
import * as Form from '@radix-ui/react-form';
import type { InitEngineConfig } from '@/api/simulationRunner';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { clamp, createInitialConfig, formatSliderValue } from './simulationSetupConfig';

type Props = {
    config: InitEngineConfig;
    setConfig: Dispatch<SetStateAction<InitEngineConfig>>;
};

export function SimulationConfigSection({ config, setConfig }: Props) {
    return (
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
                                if (e.currentTarget.value === config.maximumEVs.toString()) e.currentTarget.value = '';
                            }}
                            onBlur={(e) => {
                                const raw = e.currentTarget.value.trim();

                                if (raw === '') {
                                    setConfig((prev) => ({ ...prev, maximumEVs: createInitialConfig().maximumEVs }));
                                    return;
                                }

                                const parsedValue = Number(raw);
                                if (Number.isNaN(parsedValue)) return;

                                setConfig((prev) => ({ ...prev, maximumEVs: clamp(parsedValue, 1, 550000) }));
                            }}
                            onChange={(event) => setConfig((prev) => ({ ...prev, maximumEVs: Number(event.target.value) }))}
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
                                if (e.currentTarget.value === config.seed.toString()) e.currentTarget.value = '';
                            }}
                            onBlur={(e) => {
                                const raw = e.currentTarget.value.trim();

                                if (raw === '') {
                                    setConfig((prev) => ({ ...prev, seed: createInitialConfig().seed }));
                                    return;
                                }

                                const parsedValue = Number(raw);
                                if (Number.isNaN(parsedValue)) return;

                                setConfig((prev) => ({ ...prev, seed: Math.max(0, parsedValue) }));
                            }}
                            onChange={(event) => setConfig((prev) => ({ ...prev, seed: Number(event.target.value) }))}
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
                                if (e.currentTarget.value === config.numberOfChargers.toString()) e.currentTarget.value = '';
                            }}
                            onBlur={(e) => {
                                const raw = e.currentTarget.value.trim();

                                if (raw === '') {
                                    setConfig((prev) => ({ ...prev, numberOfChargers: createInitialConfig().numberOfChargers }));
                                    return;
                                }

                                const parsedValue = Number(raw);
                                if (Number.isNaN(parsedValue)) return;

                                setConfig((prev) => ({ ...prev, numberOfChargers: clamp(parsedValue, 1, 7500) }));
                            }}
                            onChange={(event) => setConfig((prev) => ({ ...prev, numberOfChargers: Number(event.target.value) }))}
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
                                if (e.currentTarget.value === config.processorCount.toString()) e.currentTarget.value = '';
                            }}
                            onBlur={(e) => {
                                const raw = e.currentTarget.value.trim();

                                if (raw === '') {
                                    setConfig((prev) => ({ ...prev, processorCount: createInitialConfig().processorCount }));
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
                                setConfig((prev) => ({ ...prev, dualChargerProbability: values[0] ?? 0 }))
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

                                setConfig((prev) => ({ ...prev, dualChargerProbability: clamp(parsedValue, 0, 1) }));
                            }}
                            onChange={(event) => {
                                const rawValue = event.target.value;
                                if (!/^\d*\.?\d*$/.test(rawValue)) return;

                                const parsedValue = Number(rawValue);
                                if (Number.isNaN(parsedValue)) return;

                                setConfig((prev) => ({ ...prev, dualChargerProbability: clamp(parsedValue, 0, 1) }));
                            }}
                            className="h-10 w-[80px] rounded-full border-border/80 bg-background/80 px-2 text-center text-sm font-semibold tabular-nums"
                        />
                    </div>
                </Form.Field>
            </div>
        </section>
    );
}
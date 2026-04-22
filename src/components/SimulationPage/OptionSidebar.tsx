import * as Form from '@radix-ui/react-form';
import { useMemo, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Virtuoso } from 'react-virtuoso';
import { SlidersHorizontalIcon, ClockAlert, CarFront, MapPin, Scale } from 'lucide-react';

import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';

import { updateWeights } from '@/api/weights';
import { weightMetadataAtom, setSingleWeightAction } from '@/store/weightStore';
import { stationQueueLengthsAtom, stationsConfigAtom } from "@/store/simulationStore";

function formatSliderValue(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

type WeightValue = {
  id: number;
  value: number;
};

export function UpdateWeightsSidebar() {
  const cachedWeights = useAtomValue(weightMetadataAtom);
  const setSingleWeight = useSetAtom(setSingleWeightAction);

  const [weightValues, setWeightValues] = useState<WeightValue[]>(() =>
    cachedWeights.map((weight) => ({
      id: weight.id,
      value: weight.value,
    }))
  );

  const weightsWithValues = useMemo(() => {
    return cachedWeights.map((weight) => {
      const localValue = weightValues.find((item) => item.id === weight.id)?.value ?? weight.value;
      return { ...weight, value: localValue };
    });
  }, [cachedWeights, weightValues]);

  const updateWeight = (id: number, nextValue: number) => {
    setWeightValues((current) =>
      current.map((item) => (item.id === id ? { ...item, value: nextValue } : item))
    );
  };

  if (cachedWeights.length === 0) {
    return (
      <Card className="flex flex-col w-100 h-[60vh] overflow-hidden pointer-events-auto shadow-lg bg-card/95 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-2 border-b border-border/50 p-5 shrink-0">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg tracking-tight">Adjust Weights</h3>
        </div>
        <div className="flex-1 p-5">
          <Card className="p-4 bg-muted/50 border-none shadow-none">
            <p className="text-sm text-muted-foreground text-center">No cached weights found</p>
          </Card>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col w-100 h-[60vh] overflow-hidden pointer-events-auto shadow-lg bg-card/95 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 border-b border-border/50 p-5 shrink-0">
        <Scale className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg tracking-tight">Adjust Weights</h3>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <Form.Root className="flex h-full flex-col overflow-hidden">
          <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto">
            {weightsWithValues.map((weight) => (
              <WeightSliderRow
                key={weight.id}
                id={weight.id}
                name={weight.name}
                min={weight.min}
                max={weight.max}
                value={weight.value}
                onChange={updateWeight}
                onCommit={(id, val) => {
                  updateWeights(id, { costId: id, value: val })
                    .then(() => setSingleWeight({ id, value: val }))
                    .catch((error) => console.error('Failed to update weight:', error));
                }}
              />
            ))}
          </div>
        </Form.Root>
      </div>
    </Card>
  );
}

type WeightSliderRowProps = {
  id: number;
  name: string;
  min: number;
  max: number;
  value: number;
  onChange: (id: number, value: number) => void;
  onCommit: (id: number, value: number) => void;
};

function WeightSliderRow({ id, name, min, max, value, onChange, onCommit }: WeightSliderRowProps) {
  return (
    <Form.Field name={`weight-${id}`} className="flex flex-col gap-2">
      <Form.Label asChild>
        <Label className="text-sm font-semibold text-foreground/90">{name}</Label>
      </Form.Label>

      <div className="grid grid-cols-[28px_minmax(0,1fr)_36px_48px] items-center gap-3">
        <span className="text-xs text-muted-foreground text-right">{min}</span>

        <Slider
          min={min}
          max={max}
          step={0.1}
          value={[value]}
          onValueChange={([next]) => typeof next === 'number' && onChange(id, next)}
          onValueCommit={([next]) => typeof next === 'number' && onCommit(id, next)}
          className="h-4 cursor-grab active:cursor-grabbing"
        />

        <span className="text-xs text-muted-foreground">{max}</span>

        <div className="rounded border border-border/50 bg-muted/30 px-2 py-1 text-center text-xs font-mono font-medium">
          {formatSliderValue(value)}
        </div>
      </div>
    </Form.Field>
  );
}

type QueuesSidebarProps = {
  onFocusStation: (lat: number, lon: number) => void;
};

export function QueuesSidebar({ onFocusStation }: QueuesSidebarProps) {
  const queueLengths = useAtomValue(stationQueueLengthsAtom);
  const stations = useAtomValue(stationsConfigAtom);

  const rankedQueues = Object.entries(queueLengths)
    .map(([id, len]) => ({
      stationId: Number(id),
      address: stations[Number(id)]?.address || `Station ${id}`,
      queueLength: len,
    }))
    .sort((a, b) => b.queueLength - a.queueLength);

  const maxQueueLength = rankedQueues[0]?.queueLength || 1;

  return (
    <Card className="flex flex-col w-100 h-[60vh] overflow-hidden pointer-events-auto shadow-lg bg-card/95 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 border-b border-border/50 p-5 shrink-0">
        <CarFront className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg tracking-tight">Queue Rankings</h3>
      </div>

      <div className="grow bg-muted/10">
        <Virtuoso
          className="no-scrollbar"
          style={{ height: '100%' }}
          data={rankedQueues}
          itemContent={(_, q) => {
            const widthPercentage = (q.queueLength / maxQueueLength) * 100;
            const station = stations[q.stationId];

            return (
              <div
                className="px-5 py-3 flex flex-col gap-2 group cursor-pointer hover:bg-muted/40 transition-colors border-b border-border/30 last:border-0"
                onClick={() => station?.pos && onFocusStation(station.pos.lat, station.pos.lon)}
              >
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 overflow-hidden pr-3 text-muted-foreground group-hover:text-foreground transition-colors">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate font-medium">{q.address}</span>
                  </div>
                  <span className="font-mono font-semibold shrink-0">
                    {q.queueLength} <span className="text-muted-foreground font-normal text-xs">EVs</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-secondary/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>
            );
          }}
        />
      </div>
    </Card>
  );
}

type SidebarItems = "weights" | "queues";

type SidebarProps = {
  onFocusStation: (lat: number, lon: number) => void;
};

export default function OptionsSidebar({ onFocusStation }: SidebarProps) {
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<null | SidebarItems>(null);

  const selectedComponent = () => {
    if (selectedSidebarItem === "weights") return <UpdateWeightsSidebar />;
    if (selectedSidebarItem === "queues") return <QueuesSidebar onFocusStation={onFocusStation} />;
    return null;
  };

  const Component = selectedComponent();

  return (
    <div className="absolute top-24 left-4 z-1200 flex gap-3 items-start pointer-events-none">
      <Card className="flex flex-col gap-2 p-2 pointer-events-auto shadow-lg bg-card/95 backdrop-blur-sm border-border/50">
        <Button
          variant={selectedSidebarItem === "weights" ? "default" : "ghost"}
          size="icon"
          className="transition-colors"
          onClick={() => setSelectedSidebarItem(prev => prev === "weights" ? null : "weights")}
        >
          <SlidersHorizontalIcon className="w-5 h-5" />
        </Button>
        <Button
          variant={selectedSidebarItem === "queues" ? "default" : "ghost"}
          size="icon"
          className="transition-colors"
          onClick={() => setSelectedSidebarItem(prev => prev === "queues" ? null : "queues")}
        >
          <ClockAlert className="w-5 h-5" />
        </Button>
      </Card>

      {Component && (
        <div className="pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-200">
          {Component}
        </div>
      )}
    </div>
  );
}

import * as Form from '@radix-ui/react-form';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { updateWeights } from '@/api/weights';
import { weightMetadataAtom, setSingleWeightAction } from '@/store/weightStore';


function formatSliderValue(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

type WeightValue = {
  id: number;
  value: number;
};

type UpdateWeightsSidebarProps = {
  onClose: () => void;
};

export function UpdateWeightsSidebar({
  onClose,
}: UpdateWeightsSidebarProps) {
  const cachedWeights = useAtomValue(weightMetadataAtom);

  const [weightValues, setWeightValues] = useState<WeightValue[]>(() =>
    cachedWeights.map((weight) => ({
      id: weight.id,
      value: weight.value,
    }))
  );

  const weightsWithValues = useMemo(() => {
    return cachedWeights.map((weight) => {
      const localValue =
        weightValues.find((item) => item.id === weight.id)?.value ?? weight.value;

      return {
        ...weight,
        value: localValue,
      };
    });
  }, [cachedWeights, weightValues]);

  const updateWeight = (id: number, nextValue: number) => {
    setWeightValues((current) =>
      current.map((item) =>
        item.id === id ? { ...item, value: nextValue } : item
      )
    );
  };

  const sidebarClassName = `
    absolute top-6 left-6 z-[400]
    flex w-[28rem] flex-col overflow-hidden
  `;

  if (cachedWeights.length === 0) {
    return (
      <Card className={sidebarClassName}>
        <WeightsSidebarHeader onClose={onClose} />

        <div className="flex-1 p-5">
          <Card variant="muted" className="p-4">
            <p className="text-sm text-muted-foreground">
              No cached weights found
            </p>
          </Card>
        </div>
      </Card>
    );
  }

  return (
    <Card className={sidebarClassName}>
      <WeightsSidebarHeader onClose={onClose} />

      <div className="flex flex-1 flex-col overflow-hidden p-5">
        <Form.Root className="flex h-full flex-col overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Weights
            </p>
            <span className="text-xs text-muted-foreground">
              {weightsWithValues.length}
            </span>
          </div>

          <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto pr-1">
            {weightsWithValues.map((weight) => (
              <WeightSliderRow
                key={weight.id}
                id={weight.id}
                name={weight.name}
                min={weight.min}
                max={weight.max}
                value={weight.value}
                onChange={updateWeight}
              />
            ))}
          </div>
        </Form.Root>
      </div>
    </Card>
  );
}

type WeightsSidebarHeaderProps = {
  onClose: () => void;
};

function WeightsSidebarHeader({
  onClose,
}: WeightsSidebarHeaderProps) {
  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 p-3 pb-2">
        <div className="min-w-0">
          <h2 className="truncate text-2xl leading-tight font-semibold text-center">
            Adjust Weights
          </h2>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={onClose}
              className="h-10 w-10 rounded-full absolute top-4 right-4"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Close sidebar</TooltipContent>
        </Tooltip>
      </div>
      <Separator />
    </>
  );
}

type WeightSliderRowProps = {
  id: number;
  name: string;
  min: number;
  max: number;
  value: number;
  onChange: (id: number, value: number) => void;
};

function WeightSliderRow({
  id,
  name,
  min,
  max,
  value,
  onChange,
}: WeightSliderRowProps) {
  const setSingleWeight = useSetAtom(setSingleWeightAction);

  return (
    <Form.Field
      name={`weight-${id}`}
      className="flex flex-col gap-2"
    >
      <Form.Label asChild>
        <Label className="text-sm font-semibold">{name}</Label>
      </Form.Label>

      <div className="grid grid-cols-[32px_minmax(0,1fr)_44px_64px] items-center gap-3">
        <span className="text-xs text-muted-foreground">{min}</span>

        <Slider
          min={min}
          max={max}
          step={0.1}
          value={[value]}
          onValueChange={([next]) => {
            if (typeof next === 'number') {
              onChange(id, next);
            }
          }}
          onValueCommit={([next]) => {
          if (typeof next === 'number') {

            updateWeights(id, {
              costId: id,
              value: next,
            }).then(() => {
              setSingleWeight({ id, value: next });
            }).catch((error) => {
              console.error('Failed to update weight:', error);
            });
          }
        }}
          className="h-4"
        />

        <span className="text-right text-xs text-muted-foreground">
          {max}
        </span>

        <div className="rounded-lg border border-border/60 px-2 py-1 text-right text-xs font-semibold">
          {formatSliderValue(value)}
        </div>
      </div>
    </Form.Field>
  );
}
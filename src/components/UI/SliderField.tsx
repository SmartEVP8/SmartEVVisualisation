import * as Form from '@radix-ui/react-form';
import * as Slider from '@radix-ui/react-slider';

type SliderFieldProps = {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
};

function formatValue(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export function SliderField({
  name,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: SliderFieldProps) {
  return (
    <Form.Field
      name={name}
      className="grid grid-cols-1 gap-2 md:grid-cols-[190px_minmax(0,1fr)] md:gap-6"
    >
      <Form.Label className="pt-1 text-base font-semibold leading-snug text-neutral-100">
        {label}
      </Form.Label>

      <div className="w-full max-w-[420px]">
        <div className="grid grid-cols-[32px_minmax(0,1fr)_44px_64px] items-center gap-3">
          <span className="text-sm font-medium text-neutral-400">{min}</span>

          <Slider.Root
            min={min}
            max={max}
            step={step}
            value={[value]}
            onValueChange={(values) => onChange(values[0] ?? min)}
            className="relative flex h-5 w-full touch-none select-none items-center"
          >
            <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-neutral-700">
              <Slider.Range className="absolute h-full rounded-full bg-white" />
            </Slider.Track>

            <Slider.Thumb
              className="
                block h-5 w-5 rounded-full
                border border-neutral-500
                bg-white shadow-md transition
                hover:scale-105
                focus:outline-none
                focus:ring-2 focus:ring-neutral-400/50
              "
              aria-label={label}
            />
          </Slider.Root>

          <span className="text-right text-sm font-medium text-neutral-400">
            {max}
          </span>

          <div
            className="
              rounded-xl border border-neutral-700
              bg-neutral-800/90
              px-3 py-1.5
              text-right text-sm font-semibold text-neutral-100
            "
          >
            {formatValue(value)}
          </div>
        </div>
      </div>
    </Form.Field>
  );
}
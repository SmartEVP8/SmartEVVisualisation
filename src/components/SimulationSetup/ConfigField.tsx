import type { ChangeEvent } from 'react';

type InputFieldProps = {
  variant: 'input';
  label: string;
  value: string | number;
  onChange: (value: number) => void;
  placeholder?: string;
};

type SliderFieldProps = {
  variant: 'slider';
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
};

type ConfigFieldProps = InputFieldProps | SliderFieldProps;

export function ConfigField(props: ConfigFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.onChange(Number(event.target.value));
  };

  if (props.variant === 'input') {
    return (
      <div className="grid grid-cols-[135px_1fr] items-center gap-4">
        <label className="text-base font-semibold leading-snug text-neutral-100">
          {props.label}
        </label>

        <input
          type="number"
          value={props.value}
          onChange={handleChange}
          placeholder={props.placeholder}
          className="
            h-11 w-full max-w-[220px]
            rounded-xl
            border border-neutral-600
            bg-neutral-800
            px-4
            text-base text-white
            outline-none transition
            placeholder:text-neutral-500
            focus:border-neutral-400
          "
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[135px_1fr] items-center gap-4">
      <label className="text-base font-semibold leading-snug text-neutral-100">
        {props.label}
      </label>

      <div className="flex items-center gap-2 max-w-[300px]">
        <span className="w-6 text-center text-base font-semibold text-neutral-300">
          {props.min}
        </span>

        <input
          type="range"
          min={props.min}
          max={props.max}
          step={props.step ?? 1}
          value={props.value}
          onChange={handleChange}
          className="h-2 w-full cursor-pointer accent-white"
        />

        <span className="w-8 text-center text-base font-semibold text-neutral-300">
          {props.max}
        </span>
      </div>
    </div>
  );
}
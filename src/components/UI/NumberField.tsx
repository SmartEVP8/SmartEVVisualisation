import * as Form from '@radix-ui/react-form';

type NumberFieldProps = {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export function NumberField({
  name,
  label,
  value,
  onChange,
}: NumberFieldProps) {
  return (
    <Form.Field
      name={name}
      className="grid grid-cols-1 gap-2 md:grid-cols-[190px_minmax(0,1fr)] md:gap-6"
    >
      <Form.Label className="pt-2 text-base font-semibold leading-snug text-neutral-100">
        {label}
      </Form.Label>

      <Form.Control asChild>
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="
            h-12 w-full max-w-[280px]
            rounded-2xl
            border border-neutral-700
            bg-neutral-800/90
            px-4
            text-base text-white
            outline-none transition
            placeholder:text-neutral-500
            focus:border-neutral-400
            focus:ring-2 focus:ring-neutral-500/30
          "
        />
      </Form.Control>
    </Form.Field>
  );
}
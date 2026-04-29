import { Form } from 'radix-ui';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function toSimulationTimeMs(day: number, hour: number, minute = 0) {
    return (
        day * MILLISECONDS_PER_DAY +
        hour * MILLISECONDS_PER_HOUR +
        minute * MILLISECONDS_PER_MINUTE
    );
}

function getDayFromMs(value: number) {
    return Math.floor(value / MILLISECONDS_PER_DAY);
}

function getHourFromMs(value: number) {
    return Math.floor((value % MILLISECONDS_PER_DAY) / MILLISECONDS_PER_HOUR);
}

function getMinuteFromMs(value: number) {
    return Math.floor((value % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE);
}

function formatSimulationTime(value: number) {
    const day = getDayFromMs(value);
    const hour = getHourFromMs(value).toString().padStart(2, '0');
    const minute = getMinuteFromMs(value).toString().padStart(2, '0');

    return `Day ${day} at ${hour}:${minute}`;
}

type TimePickerFieldProps = {
    name: string;
    label: string;
    value: number;
    minTime: number;
    maxTime: number;
    dayOptions: string[];
    onChange: (value: number) => void;
    formatDayLabel?: (day: string, index: number) => string;
};

export function TimePickerField({
    name,
    label,
    value,
    minTime,
    maxTime,
    dayOptions,
    onChange,
    formatDayLabel = (day) => day,
}: TimePickerFieldProps) {
    const day = getDayFromMs(value);
    const hour = getHourFromMs(value);
    const minute = getMinuteFromMs(value);

    const [hourInput, setHourInput] = useState<string | null>(null);
    const [minuteInput, setMinuteInput] = useState<string | null>(null);

    const displayHour = hourInput ?? String(hour).padStart(2, '0');
    const displayMinute = minuteInput ?? String(minute).padStart(2, '0');

    const commitTime = (nextDay: number, nextHourRaw: string, nextMinuteRaw: string) => {
        const parsedHour = Number(nextHourRaw);
        const parsedMinute = Number(nextMinuteRaw);

        const nextHour = Number.isFinite(parsedHour) ? clamp(parsedHour, 0, 23) : 0;
        const nextMinute = Number.isFinite(parsedMinute) ? clamp(parsedMinute, 0, 59) : 0;

        const nextValue = clamp(
            toSimulationTimeMs(nextDay, nextHour, nextMinute),
            minTime,
            maxTime,
        );

        setHourInput(null);
        setMinuteInput(null);

        onChange(nextValue);
    };

    const handleNumericInputChange = (
        rawValue: string,
        setter: React.Dispatch<React.SetStateAction<string | null>>,
    ) => {
        setter(rawValue.replace(/\D/g, '').slice(0, 2));
    };

    return (
        <Form.Field name={name} className="grid gap-3">
            <Form.Label asChild>
                <Label className="text-sm font-semibold text-neutral-200">{label}</Label>
            </Form.Label>

            <div className="grid grid-cols-[minmax(0,1fr)_76px_76px] gap-3">
                <select
                    value={day}
                    onChange={(event) => {
                        commitTime(Number(event.target.value), displayHour, displayMinute);
                    }}
                    className="h-12 rounded-2xl border border-border/80 bg-background/80 px-4 text-sm font-semibold shadow-inner outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
                >
                    {dayOptions.map((option, index) => (
                        <option key={`${option}-${index}`} value={index}>
                            {formatDayLabel(option, index)}
                        </option>
                    ))}
                </select>

                <Input
                    type="text"
                    inputMode="numeric"
                    value={displayHour}
                    onFocus={() => {
                        if (displayHour === '00') {
                            setHourInput('');
                        }
                    }}
                    onChange={(e) => handleNumericInputChange(e.target.value, setHourInput)}
                    onBlur={() => commitTime(day, displayHour, displayMinute)}
                    className="h-12 rounded-2xl border-border/80 bg-background/80 text-center text-sm font-semibold tabular-nums shadow-inner"
                    placeholder="HH"
                />

                <Input
                    type="text"
                    inputMode="numeric"
                    value={displayMinute}
                    onFocus={() => {
                        if (displayMinute === '00') {
                            setMinuteInput('');
                        }
                    }}
                    onChange={(e) => handleNumericInputChange(e.target.value, setMinuteInput)}
                    onBlur={() => commitTime(day, displayHour, displayMinute)}
                    className="h-12 rounded-2xl border-border/80 bg-background/80 text-center text-sm font-semibold tabular-nums shadow-inner"
                    placeholder="MM"
                />
            </div>

            <p className="rounded-2xl border border-border/50 bg-background/40 px-4 py-2 text-sm font-medium text-neutral-400">
                {formatSimulationTime(value)}
            </p>
        </Form.Field>
    );
}
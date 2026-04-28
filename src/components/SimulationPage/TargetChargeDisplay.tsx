import { simulationTimeAtom } from '@/store/simulationStore';
import { useAtomValue } from 'jotai';

export type ChargingProgressBarProps = {
  soc: number;
  targetSoC: number;
  startTime: number | null | undefined;
  finishTimeMs: number | null | undefined;
};

export function TargetChargeDisplay({ soc, targetSoC, startTime, finishTimeMs }: ChargingProgressBarProps) {
  const simTime = useAtomValue(simulationTimeAtom);

  const displaySoc = (() => {
    if (!startTime || !finishTimeMs) return soc;
    const duration = finishTimeMs - startTime;
    if (duration <= 0) return targetSoC;
    const t = Math.min((simTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    return soc + (targetSoC - soc) * eased;
  })();

  return (
    <>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">Desired Charge</span>
        <span className="text-lg font-bold">
          {Math.round(displaySoc * 100)}% → {Math.round(targetSoC * 100)}%
        </span>
      </div>
      <div className="relative h-4 overflow-hidden rounded-full bg-muted">
        <div className="absolute h-full bg-primary-foreground/3" style={{ width: '100%' }} />
        <div
          className="absolute h-full bg-primary/50 transition-[width] duration-300 ease-out"
          style={{ width: `${targetSoC * 100}%` }}
        />
        <div
          className="absolute h-full bg-primary"
          style={{ width: `${displaySoc * 100}%` }}
        />
      </div>
    </>
  );
}

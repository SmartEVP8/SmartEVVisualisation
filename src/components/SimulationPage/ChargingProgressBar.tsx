export type ChargingProgressBarProps = {
  soc: number;
  targetSoC: number;
};

export function ChargingProgressBar({ soc, targetSoC }: ChargingProgressBarProps) {
  return (
    <>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">Charging Progress</span>
        <span className="text-lg font-bold">
          {Math.round(soc * 100)}% → {Math.round(targetSoC * 100)}%
        </span>
      </div>
      <div className="relative h-4 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute h-full bg-primary-foreground/3"
          style={{ width: `${100}%` }} />
        <div
          className="absolute h-full bg-primary/50"
          style={{ width: `${targetSoC * 100}%` }} />
        <div
          className="absolute h-full bg-primary"
          style={{ width: `${soc * 100}%` }} />
      </div>
   </>
  );
}

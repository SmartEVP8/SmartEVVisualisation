import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { Clock, PauseIcon, PlayIcon, Square, Truck, Zap, Pin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { pauseSimulation, resumeSimulation, stopSimulation } from '@/api/simulationRunner';
import { globalStatsAtom, simulationTimeAtom } from '@/store/simulationStore';
import { msToPrettyDisplay } from '@/lib/msToPrettyDisplay';

type TopbarProbs = {
  isPinned: boolean;
  onTogglePin: () => void;
}

export function Topbar({ isPinned, onTogglePin }: TopbarProbs) {
  const time = useAtomValue(simulationTimeAtom);
  const simState = useAtomValue(globalStatsAtom);

  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePauseResume = async () => {
    if (isStopped || isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (isPaused) {
        await resumeSimulation();
        setIsPaused(false);
      } else {
        await pauseSimulation();
        setIsPaused(true);
      }
    } catch (error) {
      console.error(`Failed to ${isPaused ? 'resume' : 'pause'} simulation`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStop = async () => {
    if (isStopped || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await stopSimulation();
      setIsStopped(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to stop simulation', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isControlDisabled = isStopped || isSubmitting;

  return (
    <Card className="flex flex-row items-center gap-0 px-5 py-2.5 shadow-none">
      <div className="flex items-center gap-4 pr-5">
        <Truck className="h-5 w-5 shrink-0 text-blue-500" />
        <span className="font-mono text-base font-medium">
          {simState.totalEvs}
        </span>
      </div>

      <Button
        variant={isPaused ? 'outline' : 'default'}
        onClick={handlePauseResume}
        disabled={isControlDisabled}
      >
        {isPaused ? (
          <PlayIcon className="mr-1 h-4 w-4" />
        ) : (
          <PauseIcon className="mr-1 h-4 w-4" />
        )}
        {isPaused ? 'Resume' : 'Pause'}
      </Button>

      <Button
        variant="destructive"
        className="ml-2"
        onClick={handleStop}
        disabled={isControlDisabled}
      >
        <Square className="mr-1 h-4 w-4" />
        Stop
      </Button>

      <div className="flex items-center gap-4 px-5">
        <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
        <span className="font-mono text-base font-medium whitespace-nowrap">
          {msToPrettyDisplay(time)}
        </span>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex items-center gap-4 pl-5">
        <Zap className="h-5 w-5 shrink-0 text-emerald-500" />
        <span className="font-mono text-base font-medium">
          {simState.totalCharging}
        </span>
      </div>

      <Separator orientation="vertical" className="h-8 ml-5" />

      <Button
        variant={isPinned ? 'default' : 'ghost'}
        size="icon"
        className="ml-3"
        onClick={onTogglePin}
        aria-label={isPinned ? 'Unpin top bar' : 'Pin top bar'}
        title={isPinned ? 'Unpin top bar' : 'Pin top bar'}
      >
        <Pin className={`h-4 w-4 ${isPinned ? 'fill-current' : ''}`} />
      </Button>
    </Card>
  );
}
import { useAtomValue, useSetAtom } from 'jotai';
import { AlertTriangle, X } from 'lucide-react';

import { queueAlertsAtom, dismissQueueAlertAction } from '@/store/simulationStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function CriticalQueueAlerts() {
  const alerts = useAtomValue(queueAlertsAtom);
  const dismissAlert = useSetAtom(dismissQueueAlertAction);

  const activeAlerts = Object.values(alerts).sort((a, b) => b.queueLength - a.queueLength);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="absolute top-20 left-1/2 z-[1100] flex -translate-x-1/2 flex-col gap-3">
      {activeAlerts.map((alert) => (
        <Card
          key={alert.stationId}
          className="w-[28rem] border-red-500/40 bg-red-950/95 px-4 py-3 text-red-100 shadow-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-8 w-8 shrink-0" />
              <div>
                <div className="text-sm font-semibold">
                  Critical station queue detected
                </div>
                <div className="text-sm text-red-100/90">
                  {alert.address} has reached a queue of {alert.queueLength} EVs.
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-red-100 hover:bg-red-900/60 hover:text-white"
              onClick={() => dismissAlert(alert.stationId)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
import { Button } from '../ui/button';

type StartSimulationButtonProps = {
  onOpen: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export function StartSimulationButton({
  onOpen,
  disabled = false,
  isLoading = false,
}: StartSimulationButtonProps) {
  return (
    <Button
      type="button"
      onClick={onOpen}
      disabled={disabled || isLoading}
      variant="outline"
      size="lg"
      className="h-12 w-full justify-start rounded-2xl border-border/80 bg-card/95 px-4 text-left text-base font-semibold shadow-lg backdrop-blur-sm"
    >
      {isLoading ? 'Loading simulation config...' : 'Configure simulation'}
    </Button>
  );
}
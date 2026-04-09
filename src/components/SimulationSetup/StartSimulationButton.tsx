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
    <button
      type="button"
      onClick={onOpen}
      disabled={disabled || isLoading}
      className="
        w-full rounded-2xl border border-neutral-700
        bg-neutral-950/90 px-4 py-3 text-left text-base font-semibold text-white
        shadow-lg backdrop-blur-sm transition
        hover:bg-neutral-900
        disabled:cursor-not-allowed disabled:opacity-60
      "
    >
      {isLoading ? 'Loading simulation config...' : 'Configure simulation'}
    </button>
  );
}
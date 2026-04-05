import type { ReactNode } from 'react';

type SidebarProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  side?: 'left' | 'right';
  offset?: number;
};

export function Sidebar({
  isOpen,
  title,
  onClose,
  children,
  side = 'right',
  offset = 0,
}: SidebarProps) {
  const isRight = side === 'right';

  const basePosition = isRight ? 'right-6' : 'left-6';

  return (
    <aside
      style={{
        transform: isOpen
          ? `translateX(${isRight ? -offset : offset}px)`
          : undefined,
      }}
      className={`
        absolute top-6 bottom-6
        ${basePosition}
        w-[22rem] max-w-[calc(100vw-3rem)]
        flex flex-col
        bg-neutral-900
        border border-neutral-700
        ${isRight
          ? 'rounded-[2.5rem_2.5rem_0_2.5rem]'
          : 'rounded-[2.5rem_2.5rem_2.5rem_0]'}
        shadow-2xl
        overflow-hidden
        z-[1000]
        transition-all duration-300
        backdrop-blur-md
        ${
          isOpen
            ? 'opacity-100'
            : isRight
            ? 'translate-x-[110%] opacity-0 pointer-events-none'
            : '-translate-x-[110%] opacity-0 pointer-events-none'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-neutral-700">
        <h2 className="text-2xl font-semibold leading-tight text-white break-words">
          {title}
        </h2>

        <button
          onClick={onClose}
          className="
            flex items-center justify-center
            w-10 h-10
            rounded-full
            bg-neutral-800
            text-white text-xl
            border border-neutral-600
            hover:bg-neutral-700
            transition
          "
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
        {children}
      </div>
    </aside>
  );
}
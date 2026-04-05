import type { ReactNode } from 'react';

type ListItemProps = {
  children: ReactNode;
  onClick?: () => void;
};

export function ListItem({ children, onClick }: ListItemProps) {
  const className = `
    w-full
    bg-neutral-800
    border border-neutral-700
    rounded-2xl
    p-4
    flex flex-col gap-2
    text-neutral-100
    text-left
    transition
    ${onClick ? 'cursor-pointer hover:bg-neutral-700 active:scale-[0.98]' : ''}
  `;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return <div className={className}>{children}</div>;
}
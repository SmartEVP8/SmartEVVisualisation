import type { ReactNode } from 'react';

type ConfigFormCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function ConfigFormCard({
  title,
  children,
  className = '',
}: ConfigFormCardProps) {
  return (
    <section
      className={`
        w-full max-w-lg
        mx-auto
        rounded-[2rem]
        border border-neutral-700
        bg-neutral-900
        shadow-2xl
        ${className}
      `}
    >
      <div className="px-6 pt-5 pb-2">
        <h2 className="text-center text-xl font-semibold text-white">
          {title}
        </h2>
      </div>

      <div className="px-6 pb-6 pt-2">
        {children}
      </div>
    </section>
  );
}
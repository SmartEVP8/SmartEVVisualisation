import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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
    <Card className={`mx-auto w-full max-w-lg rounded-[2rem] border-border/70 bg-card/95 shadow-2xl ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-xl">{title}</CardTitle>
      </CardHeader>

      <CardContent className="pt-2">{children}</CardContent>
    </Card>
  );
}
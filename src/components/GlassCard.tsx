import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  style?: React.CSSProperties;
}

export function GlassCard({ children, className = '', hoverEffect = false, ...props }: GlassCardProps) {
  return (
    <div
      className={`
        glass
        ${hoverEffect ? 'transition-all duration-300 glass-hover' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

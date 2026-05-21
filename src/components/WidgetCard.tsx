import React from 'react';
import { GlassCard } from './GlassCard';
import * as LucideIcons from 'lucide-react';

interface WidgetCardProps {
  title: string;
  iconName?: string;
  statusNode?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function WidgetCard({ title, iconName, statusNode, children, className = '', contentClassName = '' }: WidgetCardProps) {
  const IconComponent = iconName ? (LucideIcons as any)[iconName] : null;

  return (
    <GlassCard className={`p-4 md:p-5 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-3 opacity-70 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent size={14} />}
          <span className="text-[10px] uppercase tracking-widest font-medium">
            {title}
          </span>
        </div>
        {statusNode && (
          <div className="text-[10px] font-mono">
            {statusNode}
          </div>
        )}
      </div>
      <div className={`flex-1 ${contentClassName}`}>
        {children}
      </div>
    </GlassCard>
  );
}

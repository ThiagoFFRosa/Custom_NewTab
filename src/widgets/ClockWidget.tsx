import React, { useState, useEffect } from 'react';
import { WidgetCard } from '../components/WidgetCard';

interface ClockWidgetProps {
  showSeconds?: boolean;
  format24h?: boolean;
  showDate?: boolean;
  title?: string;
  icon?: string;
}

export function ClockWidget({ showSeconds = true, format24h = true, showDate = true, title = 'Clock', icon }: ClockWidgetProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <WidgetCard title={title} iconName={icon}>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-4xl md:text-5xl font-light tracking-tight font-mono text-white">
          {time.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: showSeconds ? '2-digit' : undefined,
            hour12: !format24h
          })}
        </div>
        {showDate && (
          <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 text-white mt-3">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        )}
      </div>
    </WidgetCard>
  );
}

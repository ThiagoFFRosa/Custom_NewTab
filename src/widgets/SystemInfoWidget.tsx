import React from 'react';
import { WidgetCard } from '../components/WidgetCard';

export function SystemInfoWidget({ title = "System", icon = "Terminal" }: { title?: string, icon?: string }) {
  // TODO: Fetch from actual API in the future
  return (
    <WidgetCard 
      title={title} 
      iconName={icon} 
      statusNode={<span className="text-emerald-400">STABLE</span>}
      className="min-w-[200px]"
    >
      <div className="space-y-3 mt-2 text-white text-[11px] font-mono">
        <div>
          <div className="flex justify-between mb-1">
            <span className="opacity-50">CPU</span>
            <span>14%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <div className="bg-emerald-500/50 h-full w-[14%]"></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="opacity-50">RAM</span>
            <span>48%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
            <div className="bg-yellow-500/50 h-full w-[48%]"></div>
          </div>
        </div>
        
        <div>
           <div className="flex justify-between mb-1">
             <span className="opacity-50">Storage</span>
             <span>80%</span>
           </div>
           <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
             <div className="bg-red-500/50 h-full w-[80%]"></div>
           </div>
        </div>

        <div className="flex justify-between pt-1">
          <span className="opacity-50">Uptime</span>
          <span>14d 2h 45m</span>
        </div>
      </div>
    </WidgetCard>
  );
}


import React from 'react';
import { WidgetCard } from '../components/WidgetCard';

const mockServices = [
  { name: 'Plex', status: 'online', ms: 23 },
  { name: 'Home Assistant', status: 'online', ms: 45 },
  { name: 'Nextcloud', status: 'degraded', ms: 1200 },
  { name: 'Pi-hole', status: 'offline', ms: 0 },
];

export function ServiceStatusWidget({ title = "Service Status", icon = "Activity" }: { title?: string, icon?: string }) {
  const allOnline = mockServices.every(s => s.status === 'online');
  const someOffline = mockServices.some(s => s.status === 'offline');
  const overallStatus = allOnline ? 'STABLE' : someOffline ? 'CRITICAL' : 'WARNING';
  
  const statusColor = overallStatus === 'STABLE' ? 'text-emerald-500' : overallStatus === 'CRITICAL' ? 'text-red-500' : 'text-yellow-500';

  const statusNode = (
    <span className={`${statusColor} flex items-center gap-1.5`}>
       <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`} />
       {overallStatus}
    </span>
  );

  return (
    <WidgetCard title={title} iconName={icon} statusNode={statusNode}>
       <div className="space-y-2 mt-1">
         {mockServices.map((service, idx) => (
           <div key={idx} className="flex justify-between items-center group">
             <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full opacity-70 ${
                  service.status === 'online' ? 'bg-emerald-500' : 
                  service.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-[11px] font-mono text-white/50 group-hover:text-white/80 transition-colors">
                  {service.name}
                </span>
             </div>
             <div className="flex items-center gap-3">
               {service.status !== 'offline' && <span className="text-[9px] font-mono text-white/20">{service.ms}ms</span>}
               <span className={`text-[9px] font-mono uppercase tracking-wider ${
                 service.status === 'online' ? 'text-emerald-500/80' : 
                 service.status === 'degraded' ? 'text-yellow-500/80' : 'text-red-500/80'
               }`}>
                 {service.status === 'online' ? 'UP' : service.status === 'degraded' ? 'DEGRADED' : 'DOWN'}
               </span>
             </div>
           </div>
         ))}
       </div>
    </WidgetCard>
  );
}


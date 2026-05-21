import React from 'react';
import { WidgetCard } from '../components/WidgetCard';
import { ExternalLink } from 'lucide-react';

export function LinksSectionWidget({ title = "Quick Links", icon = "Link2" }: { title?: string, icon?: string }) {
  const quickLinks = [
    { title: 'Router Settings', url: 'http://192.168.1.1' },
    { title: 'Proxmox', url: 'https://192.168.1.100:8006' },
  ];

  return (
    <WidgetCard title={title} iconName={icon} className="min-w-[200px]">
      <div className="space-y-1 mt-1 text-white text-[11px] font-mono">
        {quickLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            className="flex items-center justify-between group p-1.5 -mx-1.5 rounded-md hover:bg-white/5 transition-colors"
          >
            <span className="text-white/60 group-hover:text-white transition-colors">{link.title}</span>
            <ExternalLink size={10} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </a>
        ))}
      </div>
    </WidgetCard>
  );
}

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { IconRenderer } from './IconRenderer';

export const popularIcons = [
  "Box", "Youtube", "Github", "Mail", "Bot", "Server", "Globe", "Folder", "Code", 
  "Database", "Monitor", "Gamepad2", "Cloud", "Drive", "Search", "Settings", 
  "Clock", "Activity", "Terminal", "PenLine", "Link2", "Star", "Heart", 
  "Music", "Video", "Camera", "Image", "MessageCircle", "Send", "Phone",
  "Calendar", "Map", "Coffee", "Briefcase", "Shield", "Zap", "Wifi", "Battery",
  "Home", "User", "Lock", "Key", "Bell", "Play", "Pause", "Command", "Cpu"
];

interface IconPickerProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className = '' }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = popularIcons.filter(i => i.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div 
        className={`flex items-center justify-between cursor-pointer ${className}`}
        onClick={() => setOpen(true)}
      >
        <span className="truncate">{value || 'Select Icon...'}</span>
        <IconRenderer type="lucide" value={value || 'Box'} size={14} color="white" className="opacity-50" />
      </div>

      {open && (
         <div 
           className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" 
           onClick={() => setOpen(false)}
         >
           <div 
             className="bg-neutral-900 border border-white/10 p-5 rounded-2xl w-[320px] max-h-[500px] h-full flex flex-col gap-4 shadow-2xl" 
             onClick={e => e.stopPropagation()}
           >
              <div className="flex justify-between items-center mb-1">
                <span className="text-white font-medium text-sm">Select Icon</span>
                <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input 
                  type="text" 
                  placeholder="Search icons..." 
                  className="w-full bg-black/50 pl-9 pr-3 py-2.5 rounded-lg text-white text-sm outline-none border border-white/10 focus:border-white/30 transition-colors" 
                  autoFocus 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-4 gap-2 overflow-y-auto custom-scrollbar flex-1 pb-2">
                 {filteredIcons.map(icon => (
                    <button 
                      key={icon} 
                      onClick={() => { onChange(icon); setOpen(false); setSearch(''); }} 
                      className="flex flex-col justify-center items-center p-3 hover:bg-white/10 rounded-xl transition-colors gap-2 group text-white/70 hover:text-white"
                      title={icon}
                    >
                       <IconRenderer type="lucide" value={icon} size={22} color="currentColor" />
                    </button>
                 ))}
                 {filteredIcons.length === 0 && (
                   <div className="col-span-4 text-center text-white/40 text-xs py-10">No icons found</div>
                 )}
              </div>
           </div>
         </div>
      )}
    </>
  );
}

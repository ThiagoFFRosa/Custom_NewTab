import React, { useState, useRef, useEffect } from 'react';
import { Pipette, ChevronDown } from 'lucide-react';
import { normalizeHex, isValidHex, hexToRgb, rgbToHex, getReadableTextColor, clampColorValue } from '../utils/color';

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  allowHexInput?: boolean;
}

const defaultPresets = [
  "#e5e7eb",
  "#ffffff",
  "#000000",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#22c55e",
  "#14b8a6",
  "#22d3ee",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899"
];

export function ColorPickerField({ label, value, onChange, className = '', allowHexInput = true }: ColorPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Safe default
  const currentColor = normalizeHex(value, "#ffffff");
  const rgb = hexToRgb(currentColor) || { r: 255, g: 255, b: 255 };

  // Local state for hex input to handle typing
  const [localHex, setLocalHex] = useState(currentColor);

  useEffect(() => {
    setLocalHex(normalizeHex(value, "#ffffff"));
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setLocalHex(newHex);
    if (isValidHex(newHex)) {
      onChange(normalizeHex(newHex));
    }
  };

  const handleRgbChange = (channel: 'r' | 'g' | 'b', val: number) => {
    const newRgb = { ...rgb, [channel]: clampColorValue(val) };
    onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const textColor = getReadableTextColor(currentColor);

  return (
    <div className={`space-y-2 relative ${className}`} ref={containerRef}>
      {label && <label className="block text-white/70 text-xs font-medium uppercase tracking-widest">{label}</label>}
      
      <div 
        className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-lg p-2 cursor-pointer hover:bg-black/60 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative flex-shrink-0 w-8 h-8 rounded-full shadow-inner border border-white/20 overflow-hidden group">
          <div className="absolute inset-0 bg-[#ccc] opacity-20 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIi8+CjxyZWN0IHg9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz4KPHJlY3QgeT0iNCIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI2ZmZiIvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIi8+Cjwvc3ZnPg==')]"></div>
          <div className="absolute inset-0 z-10" style={{ backgroundColor: currentColor }}></div>
        </div>
        
        <span className="text-white text-sm font-mono flex-1 uppercase tracking-wider">{currentColor}</span>
        
        <ChevronDown size={14} className={`text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-64 bg-[#111111]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Big Preview */}
          <div 
            className="w-full h-24 rounded-lg mb-4 flex items-center justify-center shadow-inner border border-white/5 transition-colors relative overflow-hidden"
            style={{ backgroundColor: currentColor }}
          >
             <span 
               className="relative z-10 tracking-widest uppercase text-sm font-bold opacity-90 drop-shadow-md transition-colors"
               style={{ color: textColor }}
             >
               Preview
             </span>
          </div>
          
          {/* Presets */}
          <div className="flex flex-wrap gap-2 mb-4">
            {defaultPresets.map(preset => (
              <button
                key={preset}
                onClick={() => onChange(normalizeHex(preset))}
                className={`w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 ${currentColor === preset ? 'border-white scale-110 ring-2 ring-white/30' : 'border-white/10'}`}
                style={{ backgroundColor: preset }}
                title={preset}
                type="button"
              />
            ))}
          </div>

          <div className="space-y-3 mb-4">
             {/* R */}
             <div className="flex items-center gap-3">
               <span className="text-red-400 font-mono text-xs w-3">R</span>
               <input 
                 type="range" min="0" max="255" 
                 value={rgb.r} 
                 onChange={(e) => handleRgbChange('r', parseInt(e.target.value))}
                 className="flex-1 h-1.5 bg-black/50 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-red-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer accent-red-400"
               />
               <span className="text-white/60 font-mono text-[10px] w-6 text-right">{rgb.r}</span>
             </div>
             {/* G */}
             <div className="flex items-center gap-3">
               <span className="text-green-400 font-mono text-xs w-3">G</span>
               <input 
                 type="range" min="0" max="255" 
                 value={rgb.g} 
                 onChange={(e) => handleRgbChange('g', parseInt(e.target.value))}
                 className="flex-1 h-1.5 bg-black/50 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-green-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer accent-green-400"
               />
               <span className="text-white/60 font-mono text-[10px] w-6 text-right">{rgb.g}</span>
             </div>
             {/* B */}
             <div className="flex items-center gap-3">
               <span className="text-blue-400 font-mono text-xs w-3">B</span>
               <input 
                 type="range" min="0" max="255" 
                 value={rgb.b} 
                 onChange={(e) => handleRgbChange('b', parseInt(e.target.value))}
                 className="flex-1 h-1.5 bg-black/50 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:rounded-full cursor-pointer accent-blue-400"
               />
               <span className="text-white/60 font-mono text-[10px] w-6 text-right">{rgb.b}</span>
             </div>
          </div>

          {/* Hex Input */}
          {allowHexInput && (
            <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-md p-1.5">
              <span className="text-white/40 text-xs px-1 font-mono">HEX</span>
              <input 
                type="text"
                value={localHex}
                onChange={handleHexChange}
                className={`bg-transparent outline-none border-none text-white font-mono text-sm uppercase flex-1 w-full ${!isValidHex(localHex) ? 'text-red-400' : ''}`}
                spellCheck="false"
              />
              <Pipette size={14} className="text-white/30 mx-1 flex-shrink-0" />
            </div>
          )}

        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Shortcut } from '../types';
import { GlassCard } from './GlassCard';
import { IconRenderer } from './IconRenderer';
import { getFaviconUrl } from '../utils/url';

interface ShortcutCardProps {
  shortcut: Shortcut;
  density?: 'compact' | 'comfortable' | 'spacious';
  onEdit?: () => void;
}

export const ShortcutCard: React.FC<ShortcutCardProps> = ({ shortcut, density = 'comfortable', onEdit }) => {
  const { title, subtitle, url, iconType, iconValue, iconColor, accentColor, showLabel, openInNewTab } = shortcut;

  // Resolve favicon if asked
  const finalIconValue = iconType === 'favicon' ? getFaviconUrl(url) : iconValue;

  const isCompact = density === 'compact';
  // Default to showing label unless it's compact OR explicitly turned off. If explicitly true, show it regardless.
  const displayLabel = showLabel ?? !isCompact;
  
  const heightClass = !displayLabel ? (isCompact ? 'min-h-[56px]' : 'min-h-[64px]') : (isCompact ? 'min-h-[76px]' : density === 'spacious' ? 'min-h-[108px]' : 'min-h-[92px]');
  const paddingClass = isCompact ? 'p-3' : density === 'spacious' ? 'p-5' : 'p-4';

  // Apply accent color as subtle glow or border color on hover if provided.
  // Using an inline style variable for --accent-color allows us to use it in css classes
  const style = accentColor ? { '--tw-ring-color': accentColor } as React.CSSProperties : {};

  // Hold-to-edit logic
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const startPos = React.useRef<{ x: number; y: number } | null>(null);
  const wasEditedRef = React.useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    
    startPos.current = { x: e.clientX, y: e.clientY };
    wasEditedRef.current = false;
    
    timerRef.current = setTimeout(() => {
      wasEditedRef.current = true;
      if (onEdit) onEdit();
      timerRef.current = null;
    }, 600); // 600ms hold
  };

  const cancelHold = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startPos.current && timerRef.current) {
      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);
      if (dx > 5 || dy > 5) {
        cancelHold();
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (wasEditedRef.current) {
      e.preventDefault();
    }
  };

  return (
    <a 
      href={url} 
      title={!displayLabel ? title : undefined}
      target={openInNewTab ? "_blank" : "_self"} 
      rel="noopener noreferrer"
      draggable={true}
      className="block outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-xl group relative transition-transform hover:-translate-y-0.5"
      style={style}
      onPointerDown={handlePointerDown}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      onContextMenu={(e) => {
        // Prevent context menu to allow our hold-to-edit behavior
        e.preventDefault();
      }}
      onDragStart={(e) => {
        cancelHold();
      }}
    >
      {accentColor && (
         <div 
           className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md pointer-events-none"
           style={{ backgroundColor: accentColor }}
         />
      )}
      <GlassCard 
        hoverEffect 
        className={`flex flex-col items-center justify-center gap-2 transition-all duration-300 ${heightClass} ${paddingClass} ${accentColor ? 'hover:ring-1 hover:border-transparent group-hover:ring-current' : ''}`}
        style={accentColor ? { color: accentColor } : undefined}
      >
        <div 
          className="flex-shrink-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-all duration-300"
        >
          <IconRenderer 
            type={iconType} 
            value={finalIconValue || title} 
            size={isCompact && !displayLabel ? 20 : 24} 
            color={iconColor || "currentColor"}
            className={isCompact && !displayLabel ? "w-5 h-5 text-white" : "w-6 h-6 text-white"}
          />
        </div>
        
        {displayLabel && (
          <div className="flex flex-col items-center w-full min-w-0">
            <span 
              className={`text-[10px] font-semibold uppercase tracking-wider leading-tight truncate w-full text-center transition-colors ${accentColor ? 'group-hover:text-current' : 'group-hover:text-white'}`}
              style={accentColor ? undefined : { color: 'white' }}
            >
              {title}
            </span>
            {subtitle && (
              <span className="text-white/50 text-[9px] font-mono leading-tight truncate w-full text-center mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </GlassCard>
    </a>
  );
}

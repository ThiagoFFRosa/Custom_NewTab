import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { IconType } from '../types';

interface IconRendererProps {
  type: IconType;
  value: string;
  size?: number;
  className?: string;
  color?: string;
}

export function IconRenderer({ type, value, size = 24, className = '', color }: IconRendererProps) {
  const [imgError, setImgError] = useState(false);

  if (type === 'lucide') {
    // Attempt to dynamically render Lucide icon
    // First letter uppercase for standard lucide icons
    const IconName = value.charAt(0).toUpperCase() + value.slice(1);
    const IconComponent = (LucideIcons as any)[IconName];
    
    if (IconComponent) {
      return <IconComponent size={size} className={className} style={{ color }} />;
    }
    // Fallback if not found
    return <LucideIcons.Box size={size} className={className} style={{ color }} />;
  }

  if ((type === 'image' || type === 'favicon') && !imgError) {
    return (
      <img
        src={value}
        alt="icon"
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }

  // Text fallback
  return (
    <div 
      className={`flex items-center justify-center font-bold tracking-wider ${className}`}
      style={{ width: size, height: size, color: color || 'white', fontSize: size * 0.5 }}
    >
      {type === 'text' ? value.substring(0, 2).toUpperCase() : value.substring(0, 1).toUpperCase()}
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Settings, WallpaperItem } from '../types';

interface Props {
  appearance: Settings['appearance'];
  wallpapers?: WallpaperItem[];
}

const transitionStyle = (type: string, visible: boolean) => {
  const base = { opacity: visible ? 1 : 0, transform: 'translateX(0) scale(1)', filter: 'blur(0px)' } as any;
  if (type === 'zoom-fade' && !visible) base.transform = 'scale(1.04)';
  if (type === 'blur-fade' && !visible) base.filter = 'blur(12px)';
  if (type === 'slide-left' && !visible) base.transform = 'translateX(3%)';
  if (type === 'slide-right' && !visible) base.transform = 'translateX(-3%)';
  return base;
};

export function BackgroundLayer({ appearance, wallpapers = [] }: Props) {
  const [current, setCurrent] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [showNext, setShowNext] = useState(false);
  const idxRef = useRef(0);

  const transition = appearance.backgroundTransition || { type: 'fade', durationMs: 900, easing: 'ease-out' as const };
  const slideshow = appearance.slideshow || { enabled: false, intervalMs: 60000, mode: 'random' as const, includeUploaded: true, includeRemoteUrls: true };
  const filtered = useMemo(() => wallpapers.filter((w) => (slideshow.includeUploaded && w.type === 'upload') || (slideshow.includeRemoteUrls && w.type === 'url')), [wallpapers, slideshow.includeUploaded, slideshow.includeRemoteUrls]);
  const resolveTarget = () => {
    if (slideshow.enabled && filtered.length >= 2) return filtered[idxRef.current % filtered.length]?.url || '';
    if (appearance.activeWallpaperId) return wallpapers.find((w) => w.id === appearance.activeWallpaperId)?.url || appearance.backgroundUrl;
    return appearance.backgroundType === 'url' ? appearance.backgroundUrl : '';
  };

  useEffect(() => {
    let cancelled = false;
    const target = resolveTarget();
    if (!target) return;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setNext(target);
      setShowNext(true);
      window.setTimeout(() => {
        if (cancelled) return;
        setCurrent(target);
        setNext(null);
        setShowNext(false);
      }, transition.type === 'none' ? 0 : transition.durationMs);
    };
    img.onerror = () => { if (!cancelled && slideshow.enabled && filtered.length >= 2) idxRef.current = (idxRef.current + 1) % filtered.length; };
    img.src = target;
    return () => { cancelled = true; };
  }, [appearance.backgroundUrl, appearance.activeWallpaperId, appearance.backgroundType, wallpapers, slideshow.enabled, transition.type, transition.durationMs]);

  useEffect(() => {
    if (!slideshow.enabled || filtered.length < 2) return;
    const timer = window.setInterval(() => {
      if (slideshow.mode === 'random') {
        let nextIdx = idxRef.current;
        while (nextIdx === idxRef.current && filtered.length > 1) nextIdx = Math.floor(Math.random() * filtered.length);
        idxRef.current = nextIdx;
      } else idxRef.current = (idxRef.current + 1) % filtered.length;
      const ev = new Event('slideshow-tick');
      window.dispatchEvent(ev);
      setCurrent((v) => v);
    }, Math.max(10000, Math.min(3600000, slideshow.intervalMs)));
    return () => clearInterval(timer);
  }, [slideshow.enabled, slideshow.intervalMs, slideshow.mode, filtered.length]);

  useEffect(() => {
    const fn = () => setCurrent((v) => v);
    window.addEventListener('slideshow-tick', fn);
    return () => window.removeEventListener('slideshow-tick', fn);
  }, []);

  const duration = transition.type === 'none' ? 0 : transition.durationMs;
  const common = { transition: `all ${duration}ms ${transition.easing}`, filter: `blur(${appearance.blur}px)`, transform: appearance.blur > 0 ? 'scale(1.05)' : 'scale(1)' } as React.CSSProperties;

  return <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundColor: appearance.backgroundColor }}>
    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ ...common, backgroundImage: current ? `url('${current}')` : undefined, ...transitionStyle(transition.type, true) }} />
    {next && <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ ...common, backgroundImage: `url('${next}')`, ...transitionStyle(transition.type, showNext) }} />}
    <div className="absolute inset-0" style={{ backgroundColor: appearance.overlayColor, opacity: appearance.overlayOpacity }} />
    <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 ${appearance.vignette}vmin rgba(0,0,0,0.8)` }} />
  </div>;
}

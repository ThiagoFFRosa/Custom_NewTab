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
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const lastUrlRef = useRef<string | null>(null);

  const transition = appearance.backgroundTransition || { type: 'fade', durationMs: 900, easing: 'ease-out' as const };
  const slideshow = appearance.slideshow || { enabled: false, intervalMs: 60000, mode: 'random' as const, includeUploaded: true, includeRemoteUrls: true };
  const slideshowWallpapers = useMemo(
    () => wallpapers.filter((w) => w.enabledForSlideshow !== false)
      .filter((w) => ((w.type === 'upload' || w.source === 'local') ? slideshow.includeUploaded : slideshow.includeRemoteUrls)),
    [wallpapers, slideshow.includeUploaded, slideshow.includeRemoteUrls]
  );

  const activeWallpaperUrl = useMemo(() => {
    if (appearance.activeWallpaperId) return wallpapers.find((w) => w.id === appearance.activeWallpaperId)?.url || null;
    return null;
  }, [appearance.activeWallpaperId, wallpapers]);

  const desiredUrl = slideshow.enabled && slideshowWallpapers.length > 0
    ? slideshowWallpapers[slideshowIndex % slideshowWallpapers.length]?.url || null
    : activeWallpaperUrl || appearance.backgroundUrl || null;

  useEffect(() => {
    if (!slideshow.enabled || slideshowWallpapers.length < 2) return;
    const timer = window.setInterval(() => {
      setSlideshowIndex((prev) => {
        if (slideshow.mode === 'sequential') return (prev + 1) % slideshowWallpapers.length;
        let nextIdx = prev;
        while (nextIdx === prev && slideshowWallpapers.length > 1) nextIdx = Math.floor(Math.random() * slideshowWallpapers.length);
        return nextIdx;
      });
    }, Math.max(10000, Math.min(3600000, slideshow.intervalMs)));
    return () => clearInterval(timer);
  }, [slideshow.enabled, slideshow.intervalMs, slideshow.mode, slideshowWallpapers.length]);

  useEffect(() => {
    let cancelled = false;
    if (!desiredUrl || desiredUrl === lastUrlRef.current) return;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setNext(desiredUrl);
      setShowNext(true);
      window.setTimeout(() => {
        if (cancelled) return;
        setCurrent(desiredUrl);
        lastUrlRef.current = desiredUrl;
        setNext(null);
        setShowNext(false);
      }, transition.type === 'none' ? 0 : transition.durationMs);
    };
    img.onerror = () => {
      if (cancelled) return;
      if (slideshow.enabled && slideshowWallpapers.length > 1) setSlideshowIndex((v) => (v + 1) % slideshowWallpapers.length);
      setCurrent(null);
      lastUrlRef.current = null;
    };
    img.src = desiredUrl;
    return () => { cancelled = true; };
  }, [desiredUrl, transition.durationMs, transition.type, slideshow.enabled, slideshowWallpapers.length]);

  const duration = transition.type === 'none' ? 0 : transition.durationMs;
  const common = { transition: `all ${duration}ms ${transition.easing}`, filter: `blur(${appearance.blur}px)`, transform: appearance.blur > 0 ? 'scale(1.05)' : 'scale(1)' } as React.CSSProperties;

  return <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundColor: appearance.backgroundColor }}>
    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ ...common, backgroundImage: current ? `url('${current}')` : undefined, ...transitionStyle(transition.type, true) }} />
    {next && <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ ...common, backgroundImage: `url('${next}')`, ...transitionStyle(transition.type, showNext) }} />}
    <div className="absolute inset-0" style={{ backgroundColor: appearance.overlayColor, opacity: appearance.overlayOpacity }} />
    <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 ${appearance.vignette}vmin rgba(0,0,0,0.8)` }} />
  </div>;
}

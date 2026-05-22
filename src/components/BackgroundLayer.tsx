import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Settings, WallpaperItem } from '../types';

interface Props {
  appearance: Settings['appearance'];
  wallpapers?: WallpaperItem[];
}

const getNextTransform = (type: string, visible: boolean): string => {
  if (type === 'zoom-fade') return visible ? 'scale(1)' : 'scale(1.04)';
  if (type === 'slide-left') return visible ? 'translateX(0)' : 'translateX(32px)';
  if (type === 'slide-right') return visible ? 'translateX(0)' : 'translateX(-32px)';
  return 'none';
};

const getNextFilter = (type: string, visible: boolean, baseBlurPx: number): string => {
  const blurFade = type === 'blur-fade' ? (visible ? 0 : 14) : 0;
  return `blur(${baseBlurPx + blurFade}px)`;
};

export function BackgroundLayer({ appearance, wallpapers = [] }: Props) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [isNextVisible, setIsNextVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  const transitionTimeoutRef = useRef<number | null>(null);
  const preloadIdRef = useRef(0);
  const pendingUrlRef = useRef<string | null>(null);
  const isTransitioningRef = useRef(false);

  const transition = {
    type: appearance.backgroundTransition?.type || 'fade',
    durationMs: Number(appearance.backgroundTransition?.durationMs ?? 900),
    easing: appearance.backgroundTransition?.easing || 'ease-out'
  } as const;
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
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  useEffect(() => {
    if (!slideshow.enabled || slideshowWallpapers.length < 2) return;
    const timer = window.setInterval(() => {
      if (isTransitioningRef.current) return;
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
    return () => {
      preloadIdRef.current += 1;
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const finalizeTransition = (url: string, preloadId: number) => {
    if (preloadId !== preloadIdRef.current) return;
    setCurrentUrl(url);
    pendingUrlRef.current = null;
    setNextUrl(null);
    setIsNextVisible(false);
    setIsTransitioning(false);
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!desiredUrl) {
      preloadIdRef.current += 1;
      pendingUrlRef.current = null;
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      setCurrentUrl(null);
      setNextUrl(null);
      setIsNextVisible(false);
      setIsTransitioning(false);
      return;
    }

    if (desiredUrl === currentUrl || desiredUrl === pendingUrlRef.current) return;

    const preloadId = ++preloadIdRef.current;
    const img = new Image();

    img.onload = () => {
      if (preloadId !== preloadIdRef.current) return;

      const safeDurationMs = Number.isFinite(transition.durationMs) ? Math.max(0, transition.durationMs) : 900;

      if (transition.type === 'none' || safeDurationMs <= 0 || !currentUrl) {
        setCurrentUrl(desiredUrl);
        setNextUrl(null);
        setIsNextVisible(false);
        setIsTransitioning(false);
        pendingUrlRef.current = null;
        return;
      }

      pendingUrlRef.current = desiredUrl;
      setNextUrl(desiredUrl);
      setIsNextVisible(false);
      setIsTransitioning(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (preloadId !== preloadIdRef.current) return;
          setIsNextVisible(true);
        });
      });

      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        finalizeTransition(desiredUrl, preloadId);
      }, safeDurationMs + 80);
    };

    img.onerror = () => {
      if (preloadId !== preloadIdRef.current) return;
      if (slideshow.enabled && slideshowWallpapers.length > 1) setSlideshowIndex((v) => (v + 1) % slideshowWallpapers.length);
    };

    img.src = desiredUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [desiredUrl, currentUrl, transition.type, transition.durationMs, slideshow.enabled, slideshowWallpapers.length]);

  const duration = transition.type === 'none' ? 0 : (Number.isFinite(transition.durationMs) ? Math.max(0, transition.durationMs) : 900);
  const transitionCss = `opacity ${duration}ms ${transition.easing}, transform ${duration}ms ${transition.easing}, filter ${duration}ms ${transition.easing}`;
  const baseLayerStyle = {
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: `blur(${appearance.blur}px)`,
    willChange: 'opacity, transform, filter',
    pointerEvents: 'none' as const
  };

  return <div className="fixed inset-0 pointer-events-none" style={{ backgroundColor: appearance.backgroundColor, zIndex: 0 }}>
    <div
      className="absolute inset-0"
      style={{ ...baseLayerStyle, zIndex: 1, backgroundImage: currentUrl ? `url('${currentUrl}')` : undefined, opacity: 1, transform: 'none', filter: `blur(${appearance.blur}px)` }}
    />
    {nextUrl && (
      <div
        className="absolute inset-0"
        style={{
          ...baseLayerStyle,
          zIndex: 2,
          backgroundImage: `url('${nextUrl}')`,
          opacity: isNextVisible ? 1 : 0,
          transform: getNextTransform(transition.type, isNextVisible),
          filter: getNextFilter(transition.type, isNextVisible, appearance.blur),
          transition: transitionCss
        }}
      />
    )}
    <div className="absolute inset-0" style={{ zIndex: 3, backgroundColor: appearance.overlayColor, opacity: appearance.overlayOpacity }} />
    <div className="absolute inset-0" style={{ zIndex: 3, boxShadow: `inset 0 0 ${appearance.vignette}vmin rgba(0,0,0,0.8)` }} />
  </div>;
}

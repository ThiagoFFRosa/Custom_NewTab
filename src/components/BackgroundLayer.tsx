import React, { useState, useEffect } from 'react';

interface BackgroundLayerProps {
  url?: string;
  backgroundColor?: string;
  overlayColor?: string;
  type: "url" | "random" | "color";
  overlayOpacity: number;
  blur: number;
  vignette: number;
}

const randomBackgrounds = [
  "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?q=80&w=2670&auto=format&fit=crop&grayscale=true",
  "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=2574&auto=format&fit=crop&grayscale=true",
  "https://images.unsplash.com/photo-1517721867165-f5f4b46c6ea1?q=80&w=2670&auto=format&fit=crop&grayscale=true",
  "https://images.unsplash.com/photo-1440688807730-73e4e20eff83?q=80&w=2670&auto=format&fit=crop&grayscale=true",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2670&auto=format&fit=crop&grayscale=true",
  "https://images.unsplash.com/photo-1603584824208-eb70ff73a985?q=80&w=2564&auto=format&fit=crop&grayscale=true"
];

export function BackgroundLayer({ url, backgroundColor = "#050505", overlayColor = "#000000", type, overlayOpacity, blur, vignette }: BackgroundLayerProps) {
  type = type || 'url';
  const [imgUrl, setImgUrl] = useState<string | null>(type === 'url' ? (url || null) : type === 'random' ? randomBackgrounds[0] : null);

  useEffect(() => {
    if (type === 'random') {
      // Use picsum for a random grayscale image each time
      setImgUrl(`https://picsum.photos/1920/1080?grayscale&random=${Date.now()}`);
    } else if (type === 'url') {
      setImgUrl(url || null);
    } else {
      setImgUrl(null);
    }
  }, [url, type]);

  const backgroundStyle: React.CSSProperties = {
    filter: `blur(${blur}px)`,
    transform: blur > 0 ? 'scale(1.05)' : 'scale(1)',
    backgroundColor: backgroundColor,
  };

  if (imgUrl && type !== 'color') {
    backgroundStyle.backgroundImage = `url('${imgUrl}')`;
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundColor }}>
      {/* Base Image or Color */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={backgroundStyle}
      />
      
      {/* Overlay opacity and color */}
      <div 
        className="absolute inset-0 transition-opacity duration-500"
        style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 ${vignette}vmin rgba(0,0,0,0.8)`
        }}
      />
    </div>
  );
}


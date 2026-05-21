export function normalizeHex(value: string, fallback = "#ffffff"): string {
  if (typeof value !== "string") return fallback;
  
  let hex = value.trim().toLowerCase();
  if (!hex.startsWith("#")) {
    hex = "#" + hex;
  }
  
  // Expand shorthand hex #rgb to #rrggbb
  if (hex.match(/^#[0-9a-f]{3}$/)) {
    hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  
  if (hex.match(/^#[0-9a-f]{6}$/) || hex.match(/^#[0-9a-f]{8}$/)) {
    return hex.slice(0, 7); // Strip alpha if 8 chars for our use cases
  }
  
  return fallback;
}

export function isValidHex(value: string): boolean {
  if (typeof value !== "string") return false;
  let hex = value.trim();
  if (!hex.startsWith("#")) {
    hex = "#" + hex;
  }
  return /^#[0-9a-fA-F]{3}$|^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{8}$/.test(hex);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!isValidHex(hex)) return null;
  
  let normalized = normalizeHex(hex);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

export function getReadableTextColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  
  // Calculate relative luminance.
  const luma = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return luma > 0.5 ? "#000000" : "#ffffff";
}

export function clampColorValue(value: number): number {
  if (isNaN(value)) return 0;
  return Math.max(0, Math.min(255, Math.round(value)));
}

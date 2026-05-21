export type IconType = "lucide" | "image" | "text" | "favicon";

export interface Shortcut {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  categoryId: string;
  iconType: IconType;
  iconValue: string;
  iconColor?: string;
  accentColor?: string;
  showLabel?: boolean;
  enabled: boolean;
  openInNewTab: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  enabled: boolean;
  sortOrder: number;
}

export type WidgetPosition = "left" | "right" | "bottom" | "main";
export type WidgetSize = "small" | "medium" | "large";

export interface Widget {
  id: string;
  type: string;
  title: string;
  icon?: string;
  enabled: boolean;
  position: WidgetPosition;
  size: WidgetSize;
  config: Record<string, any>;
  sortOrder: number;
}

export interface Settings {
  title: string;
  search: {
    engineName: string;
    searchUrl: string;
    placeholder: string;
  };
  appearance: {
    backgroundType: "url" | "random" | "color";
    backgroundUrl: string;
    backgroundColor: string;
    overlayColor: string;
    overlayOpacity: number;
    blur: number;
    vignette: number;
    accentColor: string;
    density: "compact" | "comfortable" | "spacious";
  };
}

export interface DashboardConfig {
  settings: Settings;
  categories: Category[];
  shortcuts: Shortcut[];
  widgets: Widget[];
  availableBackgrounds: string[];
}

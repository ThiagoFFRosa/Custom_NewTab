import { DashboardConfig, WallpaperItem } from '../types';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL as string) || '';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const getConfig = () => request<DashboardConfig>('/api/config');
export const saveConfig = (config: DashboardConfig) => request<DashboardConfig>('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
export const resetConfig = () => request<DashboardConfig>('/api/config/reset', { method: 'POST' });
export const exportConfig = () => request<DashboardConfig>('/api/config/export');
export const importConfig = (json: DashboardConfig) => request<DashboardConfig>('/api/config/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(json) });

export const getWallpapers = () => request<WallpaperItem[]>('/api/wallpapers');
export const addWallpaperUrls = (urls: string[]) => request<{ok:boolean; added: WallpaperItem[]; invalid: string[]}>('/api/wallpapers/url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urls }) });
export async function uploadWallpapers(files: File[]) {
  const body = new FormData();
  files.forEach((f) => body.append('files', f));
  return request<{ok:boolean; files: WallpaperItem[]}>('/api/uploads/backgrounds', { method: 'POST', body });
}
export const deleteWallpaper = (id: string) => request('/api/wallpapers/' + encodeURIComponent(id), { method: 'DELETE' });
export const deleteWallpapers = (ids: string[]) => request('/api/wallpapers/delete-many', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
export const updateWallpaper = (id: string, payload: Partial<Pick<WallpaperItem, 'enabledForSlideshow' | 'name'>>) => request<{ok:boolean; wallpaper: WallpaperItem}>('/api/wallpapers/' + encodeURIComponent(id), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
export const useWallpaper = (id: string) => request<DashboardConfig>('/api/wallpapers/' + encodeURIComponent(id) + '/use', { method: 'POST' });

async function upload(path: string, file: File) {
  const body = new FormData();
  body.append('file', file);
  return request<{ url: string; filename: string }>(path, { method: 'POST', body });
}

export const uploadBackground = (file: File) => upload('/api/uploads/background', file);
export const listBackgrounds = () => request<Array<{ filename: string; url: string }>>('/api/uploads/backgrounds');
export const deleteBackground = (filename: string) => request('/api/uploads/backgrounds/' + encodeURIComponent(filename), { method: 'DELETE' });

export const uploadIcon = (file: File) => upload('/api/uploads/icon', file);
export const listIcons = () => request<Array<{ filename: string; url: string }>>('/api/uploads/icons');
export const deleteIcon = (filename: string) => request('/api/uploads/icons/' + encodeURIComponent(filename), { method: 'DELETE' });

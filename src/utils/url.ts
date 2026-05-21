export function isUrl(text: string): boolean {
  if (text.startsWith('http://') || text.startsWith('https://')) return true;
  if (text.startsWith('localhost:')) return true;
  
  // Basic IP matching like 192.168.x.x
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]{1,5})?$/;
  if (ipRegex.test(text)) return true;

  // Basic domain matching
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (domainRegex.test(text.split('/')[0])) return true;
  if (text.endsWith('.local')) return true;

  return false;
}

export function formatUrl(text: string): string {
  if (text.startsWith('http://') || text.startsWith('https://')) return text;
  return `http://${text}`;
}

export function getFaviconUrl(urlStr: string): string {
  try {
    const url = new URL(formatUrl(urlStr));
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch (e) {
    return '';
  }
}

import fs from 'fs/promises';
import path from 'path';

export async function safeJsonWrite(filePath, data, options = {}) {
  const { backupPath, historyDir, maxHistory = 20 } = options;
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(filePath);
    if (backupPath) {
      await fs.copyFile(filePath, backupPath);
    }
    if (historyDir) {
      await fs.mkdir(historyDir, { recursive: true });
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      await fs.copyFile(filePath, path.join(historyDir, `${ts}.json`));
      const files = (await fs.readdir(historyDir)).filter((f) => f.endsWith('.json')).sort();
      if (files.length > maxHistory) {
        const toDelete = files.slice(0, files.length - maxHistory);
        await Promise.all(toDelete.map((f) => fs.unlink(path.join(historyDir, f))));
      }
    }
  } catch {
    // first write
  }

  const tmpPath = filePath.replace(/\.json$/, '.tmp.json');
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmpPath, filePath);
}

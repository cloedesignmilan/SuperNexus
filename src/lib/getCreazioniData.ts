import fs from 'fs';
import path from 'path';

export interface CreazioniNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: CreazioniNode[];
}

export function getCreazioniTree(dirPath: string, basePath = '/Creazioni'): CreazioniNode[] {
  const absoluteDir = path.join(process.cwd(), 'public', dirPath);
  if (!fs.existsSync(absoluteDir)) return [];

  const items = fs.readdirSync(absoluteDir);
  const nodes: CreazioniNode[] = [];

  for (const item of items) {
    if (item === '.DS_Store') continue;
    
    const itemPath = path.join(absoluteDir, item);
    const stat = fs.statSync(itemPath);
    // Remove unsafe characters from URL paths, but wait, the folders have spaces and >
    // We should encodeURI if we use it in src, but let's just keep the literal path for now.
    const relativePath = `${basePath}/${item}`;

    if (stat.isDirectory()) {
      nodes.push({
        name: item,
        path: relativePath,
        isDirectory: true,
        children: getCreazioniTree(path.join(dirPath, item), relativePath),
      });
    } else if (['.webp', '.jpg', '.jpeg', '.png'].includes(path.extname(item).toLowerCase())) {
      nodes.push({
        name: item,
        path: relativePath,
        isDirectory: false,
      });
    }
  }

  // Sort directories first, then files
  return nodes.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });
}

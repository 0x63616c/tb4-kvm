import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'dist',
  'client',
);
const mount = '/tb4-kvm';
const port = Number.parseInt(process.env.PORT ?? '4173', 10);
const mediaTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.woff2', 'font/woff2'],
]);

createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
    if (requestUrl.pathname === mount) {
      response.writeHead(308, { location: `${mount}/` });
      response.end();
      return;
    }
    if (!requestUrl.pathname.startsWith(`${mount}/`)) {
      response.writeHead(404).end('Not found');
      return;
    }

    const relative = decodeURIComponent(
      requestUrl.pathname.slice(mount.length + 1),
    );
    let filePath = path.resolve(root, relative || 'index.html');
    if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
      response.writeHead(400).end('Invalid path');
      return;
    }
    if ((await stat(filePath)).isDirectory())
      filePath = path.join(filePath, 'index.html');
    const body = await readFile(filePath);
    response.writeHead(200, {
      'content-type':
        mediaTypes.get(path.extname(filePath)) ?? 'application/octet-stream',
    });
    response.end(body);
  } catch (error) {
    response.writeHead(error?.code === 'ENOENT' ? 404 : 500).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Pages preview: http://127.0.0.1:${port}${mount}/`);
});

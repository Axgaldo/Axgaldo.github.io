// Copia los ficheros estáticos a dist/ para el despliegue.
// Así el artefacto de GitHub Pages no incluye node_modules ni tests.
import { cp, mkdir, rm } from 'node:fs/promises';

const OUT = 'dist';

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT);
await cp('index.html', `${OUT}/index.html`);
await cp('favicon.svg', `${OUT}/favicon.svg`);
await cp('assets', `${OUT}/assets`, { recursive: true });

console.log(`✔ listo: ${OUT}/`);

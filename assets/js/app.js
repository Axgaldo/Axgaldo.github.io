/**
 * Lobby CRT de AxGaldo.
 *
 * Arranque: la consola escribe los datos del usuario mientras se
 * consultan sus GitHub Pages; después lista los proyectos en el
 * carrusel y escribe los datos del proyecto seleccionado.
 */

import { MANUAL_PROJECTS, SITE } from './data.js';
import { fetchGithubProjects, mergeProjects } from './github.js';
import { Typewriter } from './typewriter.js';
import { Carousel } from './carousel.js';

const $ = (selector) => document.querySelector(selector);

const consoleEl = $('#console');
const bootEl = $('#console-boot');
const projEl = $('#console-project');
const srMirror = $('#sr-console');
const phosphorBtn = $('#phosphor-btn');

const tw = new Typewriter(consoleEl);
const carousel = new Carousel($('#carousel'), { onSelect: showProject });

/** Token para ignorar escrituras de proyecto ya sustituidas. */
let showToken = 0;

/* --- Ayudas para describir líneas de consola ------------------ */

const text = (t) => ({ text: t });
const link = (label, href) => ({ text: label, href });
const line = (...segments) => ({ segments });

/** Entra texto en anchura fija, con sangría (estética de consola). */
function wrapText(value, width, indent = '  ') {
  const words = value.split(/\s+/).filter(Boolean);
  const rows = [];
  let current = '';
  for (const word of words) {
    if (current && current.length + word.length + 1 > width) {
      rows.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) rows.push(current);
  return rows.map((row) => indent + row);
}

/** Texto plano de un bloque de líneas (para el espejo accesible). */
function plainText(lines) {
  return lines.map((l) => l.segments.map((s) => s.text).join('')).join('\n');
}

function mirror(message) {
  srMirror.textContent = message;
}

/* --- Fósforo blanco / verde ------------------------------------ */

function applyPhosphor(mode, { persist = false } = {}) {
  const value = mode === 'green' ? 'green' : 'white';
  document.documentElement.dataset.phosphor = value;
  phosphorBtn.setAttribute('aria-pressed', String(value === 'green'));
  if (persist) localStorage.setItem('axgaldo.phosphor', value);
}

function initPhosphor() {
  const param = new URLSearchParams(location.search).get('phosphor');
  if (param === 'green' || param === 'white') {
    applyPhosphor(param);
    return;
  }
  // Por defecto, fósforo verde; el blanco solo si se guardó a mano.
  applyPhosphor(localStorage.getItem('axgaldo.phosphor') === 'white' ? 'white' : 'green');
}

/* --- Bloques de la consola -------------------------------------- */

/** Mide el ancho de caracteres disponible y lo acota. */
function measureBoxWidth() {
  const probe = document.createElement('span');
  probe.className = 'line';
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
  probe.textContent = 'M'.repeat(10);
  projEl.appendChild(probe);
  const charWidth = probe.getBoundingClientRect().width / 10 || 8;
  probe.remove();
  const columns = Math.floor(projEl.clientWidth / charWidth);
  return Math.max(28, Math.min(46, columns));
}

function bootLines() {
  const user = SITE.user;
  const fecha = new Date().toLocaleDateString('es-ES');
  const width = measureBoxWidth();
  return [
    { segments: [text(`crt-88 bios v${SITE.version} · ${fecha}`)], className: 'dim' },
    { segments: [{ text: '─'.repeat(width), speed: 2 }], className: 'dim' },
    line(text(`usuario : ${user.name}`)),
    line(text('github  : '), link(`@${user.github}`, user.githubUrl)),
    { segments: [text('pages   : escaneando repos públicos…')], pause: 200 },
  ];
}

function projectLines(project, index, total) {
  const width = measureBoxWidth();
  const head = `proyecto ${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
  const top = `┌─[ ${head} ]`;
  const lines = [
    { segments: [{ text: top + '─'.repeat(width - top.length - 1) + '┐', speed: 2 }], className: 'frame' },
    line(text('  título       : '), text(project.title)),
    line(
      text(
        `  origen       : ${
          project.kind === 'manual' ? 'proyecto personal' : 'github pages (auto)'
        }`,
      ),
    ),
  ];
  if (project.repoUrl) {
    lines.push(
      line(
        text('  repo         : '),
        link(project.repoUrl.replace(/^https?:\/\/github\.com\//, 'github.com/'), project.repoUrl),
      ),
    );
  }
  lines.push(line(text('  url          : '), link(project.url.replace(/^https?:\/\//, ''), project.url)));
  if (project.updatedAt) {
    lines.push(line(text(`  actualizado  : ${project.updatedAt}`)));
  }
  if (project.description) {
    lines.push({ segments: [text('  descripción  :')], pause: 60 });
    for (const row of wrapText(project.description, width - 4)) {
      lines.push(line(text(row)));
    }
  }
  lines.push({
    segments: [{ text: '└' + '─'.repeat(width - 2) + '┘', speed: 2 }],
    className: 'frame',
  });
  return lines;
}

/* --- Carga de proyectos ---------------------------------------- */

async function loadAuto() {
  if (!SITE.autoDetect) return { projects: [], repoCount: 0, state: 'off' };
  try {
    const { projects, repoCount } = await fetchGithubProjects(SITE.user.github);
    return { projects, repoCount, state: 'ok' };
  } catch (error) {
    return { projects: [], repoCount: 0, state: 'error', message: error.message };
  }
}

/* --- Muestra el proyecto seleccionado en la consola ------------- */

async function showProject(project, index) {
  const token = ++showToken;
  tw.clear(projEl);
  const lines = project
    ? projectLines(project, index, carousel.projects.length)
    : [line(text('sin proyectos configurados todavía.'))];
  const done = await tw.typeLines(projEl, lines);
  if (done && token === showToken) mirror(plainText(lines));
}

/* --- Interfaz ---------------------------------------------------- */

function bindUI() {
  phosphorBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.phosphor === 'white' ? 'green' : 'white';
    applyPhosphor(next, { persist: true });
  });

  $('#carousel-prev').addEventListener('click', () => carousel.prev());
  $('#carousel-next').addEventListener('click', () => carousel.next());

  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      carousel.prev();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      carousel.next();
    }
  });
}

/* --- Arranque ---------------------------------------------------- */

async function init() {
  initPhosphor();
  bindUI();

  // El escaneo de la API arranca en paralelo al texto de arranque.
  const scan = loadAuto();
  await tw.typeLines(bootEl, bootLines());
  document.querySelector('.mascot')?.classList.add('on');

  const { projects: auto, repoCount, state, message } = await scan;
  const projects = mergeProjects(MANUAL_PROJECTS, auto);

  const report =
    state === 'off'
      ? 'pages   : detección automática desactivada · modo manual'
      : state === 'error'
        ? `pages   : escaneo no disponible (${message}) · modo manual`
        : `pages   : ${auto.length} detectadas de ${repoCount} repos · ${projects.length} en el lobby`;
  await tw.typeLines(bootEl, [
    state === 'ok' ? line(text(report)) : { segments: [text(report)], className: 'dim' },
    line(text('')),
    { segments: [text('ayuda   : [↑↓ / ←→] cambiar · [rueda/deslizar] explorar')], className: 'dim' },
    {
      segments: [
        text('código  : '),
        link('github.com/AxGaldo/Axgaldo.github.io', 'https://github.com/AxGaldo/Axgaldo.github.io'),
        text(' · MIT'),
      ],
      className: 'dim',
    },
  ]);

  carousel.setProjects(projects);
}

init();

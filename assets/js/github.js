/**
 * Detección automática de GitHub Pages a partir de los repositorios
 * públicos de un usuario (API REST de GitHub, sin token).
 *
 * La API sin autenticar permite 60 peticiones/hora por IP, de sobra
 * para un lobby personal. Si falla (sin conexión, límite alcanzado…),
 * la web cae con elegancia a la lista manual de `data.js`.
 */

const GITHUB_API = 'https://api.github.com/users';
const TIMEOUT_MS = 8000;

/**
 * URL pública de la site Pages de un repo. GitHub Pages sirve los
 * sites de proyecto en minúsculas (usuario.github.io/repo/); si el
 * repo tiene un dominio propio en `homepage`, se usa ese.
 *
 * @param {string} user nombre de usuario de GitHub.
 * @param {{ name: string, homepage?: string | null }} repo repo de la API.
 * @returns {string} URL pública del site.
 */
export function pagesUrl(user, repo) {
  const homepage = typeof repo.homepage === 'string' ? repo.homepage.trim() : '';
  if (/^https?:\/\//i.test(homepage)) return homepage;
  return `https://${user.toLowerCase()}.github.io/${repo.name.toLowerCase()}/`;
}

/** ¿Es el repo del propio lobby (usuario.github.io)? */
export function isLobbyRepo(user, repo) {
  return repo.name.toLowerCase() === `${user.toLowerCase()}.github.io`;
}

/** Convierte un repo con Pages activas en un proyecto del lobby. */
export function repoToProject(user, repo) {
  return {
    kind: 'auto',
    title: repo.name,
    description: typeof repo.description === 'string' ? repo.description : '',
    url: pagesUrl(user, repo),
    repoUrl: typeof repo.html_url === 'string' ? repo.html_url : '',
    updatedAt: typeof repo.pushed_at === 'string' ? repo.pushed_at.slice(0, 10) : '',
  };
}

/**
 * Devuelve los proyectos Pages detectados y el total de repos
 * públicos del usuario. Lanza un error si la API no responde; el
 * llamador decide si cae a la lista manual.
 *
 * @param {string} user nombre de usuario de GitHub.
 * @returns {Promise<{ projects: Array<object>, repoCount: number }>}
 *   proyectos con Pages activas (ordenados por actualización, tal
 *   como los devuelve la API) y número total de repos públicos.
 */
export async function fetchGithubProjects(user) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `${GITHUB_API}/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`,
      { headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const repos = await res.json();
    if (!Array.isArray(repos)) throw new Error('respuesta inesperada');
    const projects = repos
      .filter((repo) => repo.has_pages && !isLobbyRepo(user, repo))
      .map((repo) => repoToProject(user, repo));
    return { projects, repoCount: repos.length };
  } finally {
    clearTimeout(timer);
  }
}

const normUrl = (url) => String(url).toLowerCase().replace(/\/+$/, '').trim();
const normTitle = (title) => String(title).toLowerCase().replace(/[\s._-]+/g, '-').trim();

/**
 * Fusiona manuales y automáticos sin duplicados. Los manuales van
 * primero (quedan "fijados"); se deduplica por URL (o por título si
 * no hay URL). Las entradas inválidas se descartan.
 *
 * @param {Array<object>} manual proyectos añadidos a mano.
 * @param {Array<object>} auto proyectos detectados vía API.
 * @returns {Array<object>} lista final para el lobby.
 */
export function mergeProjects(manual = [], auto = []) {
  const seen = new Set();
  const out = [];
  for (const project of [...(manual ?? []), ...(auto ?? [])]) {
    if (!project || typeof project.title !== 'string' || !project.title.trim()) continue;
    const key = project.url ? normUrl(project.url) : normTitle(project.title);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(project);
  }
  return out;
}

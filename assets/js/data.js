/**
 * Configuración del lobby. Edita este archivo para cambiar tus datos
 * o añadir proyectos a mano.
 */

export const SITE = {
  /** Versión del lobby (se muestra en el arranque de la consola). */
  version: '1.0.0',

  title: 'AxGaldo · Lobby CRT',

  user: {
    name: 'Antonio Galdó Seiquer',
    github: 'AxGaldo',
    githubUrl: 'https://github.com/AxGaldo',
  },

  /**
   * Detección automática de GitHub Pages: consulta la API pública de
   * GitHub y lista todos tus repos públicos con Pages activas.
   * Ponlo a `false` para mostrar solo los proyectos manuales.
   */
  autoDetect: true,
};

/**
 * Proyectos personales "a mano". Se muestran primero y sirven de
 * respaldo si la API de GitHub no responde. Si un proyecto manual
 * coincide (por URL) con uno detectado automáticamente, gana el manual.
 *
 * Ejemplo:
 *   {
 *     kind: 'manual',
 *     title: 'mi-proyecto',
 *     description: 'Lo que hace mi proyecto.',
 *     url: 'https://axgaldo.github.io/mi-proyecto/',
 *     repoUrl: 'https://github.com/AxGaldo/mi-proyecto',
 *   },
 */
export const MANUAL_PROJECTS = [
  {
    kind: 'manual',
    title: 'chinese-vault',
    description:
      '☢️ El refugio definitivo para aprender chino mandarín en español: apuntes, vocabulario y guía de supervivencia HSK.',
    url: 'https://axgaldo.github.io/chinese-vault/',
    repoUrl: 'https://github.com/AxGaldo/chinese-vault',
  },
  {
    kind: 'manual',
    title: 'legacy-manager',
    description: "App to manage your family's heritage.",
    url: 'https://axgaldo.github.io/legacy-manager/',
    repoUrl: 'https://github.com/AxGaldo/legacy-manager',
  },
];

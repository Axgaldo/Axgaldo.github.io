/**
 * Configuración del lobby. Edita este archivo para cambiar tus datos
 * o añadir proyectos a mano.
 */

export const SITE = {
  /** Versión del lobby (se muestra en el arranque de la consola). */
  version: '1.2.0',

  title: 'AxGaldo · Lobby CRT',

  user: {
    name: 'Antonio Galdó Seiquer',
    github: 'AxGaldo',
    githubUrl: 'https://github.com/AxGaldo',
    /** Bio que escribe la consola al pulsar el botón SOBRE MÍ. */
    bio: [
      'Mi trayectoria se asienta en una doble especialización: la Ingeniería de Sistemas y Ciberseguridad, y la Composición Digital (VFX).',
      '',
      'La experiencia en entornos de producción audiovisual (Nuke, Houdini, After Effects) ha cultivado una mentalidad analítica y metódica, habilidades que traslado directamente al ámbito de la seguridad de la información. Esto incluye:',
      '',
      '- Análisis profundo de sistemas y troubleshooting de incidentes complejos.',
      '- Programación y optimización de flujos de trabajo (pipelines).',
      '- Adaptabilidad en entornos técnicos multidisciplinares.',
      '',
      'Recientemente he consolidado mi base en seguridad con la certificación CompTIA Security+, centrando mi interés profesional en la protección de infraestructuras y la gestión de riesgos.',
    ].join('\n'),
  },

  /**
   * Detección automática de GitHub Pages: consulta la API pública de
   * GitHub y lista todos tus repos públicos con Pages activas.
   * Ponlo a `false` para mostrar solo los proyectos manuales.
   */
  autoDetect: true,

  /** Sonido de teletipo al escribir (el botón SONIDO lo recuerda). */
  sound: true,
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

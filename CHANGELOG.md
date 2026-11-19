# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
versionado con [SemVer](https://semver.org/lang/es/).

## [1.0.0] — 2026-11-19

### Added

- Lobby tipo consola CRT: pantalla abombada con scanlines, barrido,
  reflejos y efecto de encendido.
- Consola que escribe dinámicamente los datos de GitHub (AxGaldo /
  Antonio Galdó Seiquer) y los de cada proyecto, con cursor de bloque
  parpadeante siempre al final.
- Carrusel holográfico 3D de proyectos: pila vertical en escritorio
  (clic, rueda del ratón y flechas del teclado) y tira horizontal con
  flechas en móvil (también con deslizamiento táctil).
- Detección automática de GitHub Pages vía la API pública de GitHub,
  con lista manual de respaldo en `assets/js/data.js`.
- Tema de fósforo blanco/verde con botón en el bisel y persistencia.
- Accesibilidad: respeta `prefers-reduced-motion`, navegación por
  teclado con roving tabindex y espejo `aria-live` de la consola.
- CI con ESLint, Vitest (unitarias) y Playwright (E2E), y despliegue
  automático a GitHub Pages con GitHub Actions.
- Licencia MIT.

# AxGaldo · Lobby CRT

[![CI](https://github.com/AxGaldo/Axgaldo.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/AxGaldo/Axgaldo.github.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/AxGaldo/Axgaldo.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/AxGaldo/Axgaldo.github.io/actions/workflows/deploy.yml)
[![Versión](https://img.shields.io/github/v/tag/AxGaldo/Axgaldo.github.io?label=versi%C3%B3n)](https://github.com/AxGaldo/Axgaldo.github.io/tags)
[![Licencia: MIT](https://img.shields.io/badge/licencia-MIT-blue)](LICENSE)

Lobby tipo **consola CRT** con todas las GitHub Pages de
[AxGaldo (Antonio Galdó Seiquer)](https://github.com/AxGaldo).

- **Escritorio**: a la izquierda, un monitor de tubo con pantalla
  abombada, scanlines y reflejos; su consola escribe los datos del
  proyecto seleccionado. A la derecha, un carrusel vertical
  **holográfico 3D** con las Pages (clic, rueda del ratón o flechas).
- **Móvil**: tus datos arriba, los datos del proyecto debajo y el
  carrusel horizontal abajo, con flechitas ‹ › y deslizamiento táctil.
- **Fósforo blanco o verde** con el botón `FÓSFORO` del bisel.

## Cómo se llena el lobby

1. **Detección automática**: al cargar, se consulta la
   [API pública de GitHub](https://docs.github.com/es/rest/repos/repos#list-repositories-for-a-user)
   y se listan todos los repos públicos con Pages activas
   (`has_pages`), excluyendo el propio lobby. Sin token no hay que
   configurar nada; el límite de 60 peticiones/hora por IP va sobrado.
2. **Proyectos manuales**: los de `MANUAL_PROJECTS` en
   [`assets/js/data.js`](assets/js/data.js) se muestran **primero**
   (quedan fijados) y sirven de respaldo si la API no responde.

> Si un repo tiene dominio propio, ponlo en el campo `homepage` del
> repo y el lobby lo usará automáticamente.

### Añadir un proyecto a mano

Edita `MANUAL_PROJECTS` en `assets/js/data.js`:

```js
{
  kind: 'manual',
  title: 'mi-proyecto',
  description: 'Lo que hace mi proyecto.',
  url: 'https://axgaldo.github.io/mi-proyecto/',
  repoUrl: 'https://github.com/AxGaldo/mi-proyecto',
},
```

Si el proyecto coincide por URL con uno detectado, manda el manual.
Si prefieres listar **solo** los manuales, pon `autoDetect: false`
en el mismo archivo.

> Los repos **privados** con Pages no salen en la API pública:
> añádelos a mano.

## Desarrollo

```bash
npm install     # instalar dependencias
npm run dev     # servir el sitio en http://127.0.0.1:4173
npm run lint    # ESLint
npm test        # pruebas unitarias (Vitest)
npm run test:e2e# pruebas E2E (Playwright, abre su propio servidor)
npm run build   # copia el sitio estático a dist/
```

## Despliegue

El workflow [`deploy.yml`](.github/workflows/deploy.yml) corre las
pruebas con cada push a `main` y, si pasan, despliega `dist/` en
GitHub Pages. Configuración única:

**Settings → Pages → Build and deployment → Source: GitHub Actions**

El versionado es SemVer; cada release lleva su etiqueta (`v1.0.0`…)
y su entrada en el [CHANGELOG](CHANGELOG.md).

## Licencia

[MIT](LICENSE) © Antonio Galdó Seiquer ([@AxGaldo](https://github.com/AxGaldo))

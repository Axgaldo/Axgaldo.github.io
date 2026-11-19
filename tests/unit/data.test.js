import { describe, expect, it } from 'vitest';
import { MANUAL_PROJECTS, SITE } from '../../assets/js/data.js';

describe('SITE', () => {
  it('tiene los datos del usuario', () => {
    expect(SITE.user.name).toBe('Antonio Galdó Seiquer');
    expect(SITE.user.github).toBe('AxGaldo');
    expect(SITE.user.githubUrl).toBe('https://github.com/AxGaldo');
  });

  it('la bio está definida y menciona la especialización', () => {
    expect(typeof SITE.user.bio).toBe('string');
    expect(SITE.user.bio).toContain('Ciberseguridad');
    expect(SITE.user.bio).toContain('CompTIA Security+');
  });

  it('el sonido por defecto es un booleano', () => {
    expect(typeof SITE.sound).toBe('boolean');
  });

  it('la versión sigue semver', () => {
    expect(SITE.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('MANUAL_PROJECTS', () => {
  it('cada proyecto manual tiene título y URL http(s) única', () => {
    const urls = new Set();
    for (const project of MANUAL_PROJECTS) {
      expect(project.title, `título de ${project.title}`).toMatch(/.+/);
      expect(project.url, `url de ${project.title}`).toMatch(/^https?:\/\/.+/);
      expect(urls.has(project.url), `url duplicada: ${project.url}`).toBe(false);
      urls.add(project.url);
    }
  });

  it('los proyectos manuales declaran kind: "manual"', () => {
    for (const project of MANUAL_PROJECTS) {
      expect(project.kind).toBe('manual');
    }
  });
});

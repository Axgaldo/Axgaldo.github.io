import { describe, expect, it } from 'vitest';
import {
  isLobbyRepo,
  mergeProjects,
  pagesUrl,
  repoToProject,
} from '../../assets/js/github.js';

describe('pagesUrl', () => {
  it('usa el dominio propio si el repo tiene homepage', () => {
    expect(pagesUrl('AxGaldo', { name: 'MiRepo', homepage: 'https://midominio.com' })).toBe(
      'https://midominio.com',
    );
  });

  it('ignora homepage vacías o no válidas', () => {
    expect(pagesUrl('AxGaldo', { name: 'repo', homepage: '' })).toBe(
      'https://axgaldo.github.io/repo/',
    );
    expect(pagesUrl('AxGaldo', { name: 'repo', homepage: null })).toBe(
      'https://axgaldo.github.io/repo/',
    );
    expect(pagesUrl('AxGaldo', { name: 'repo', homepage: 'no-es-url' })).toBe(
      'https://axgaldo.github.io/repo/',
    );
  });

  it('construye la URL de Pages en minúsculas', () => {
    expect(pagesUrl('AxGaldo', { name: 'Proyecto-Uno' })).toBe(
      'https://axgaldo.github.io/proyecto-uno/',
    );
  });
});

describe('isLobbyRepo', () => {
  it('detecta el repo del lobby sin importar mayúsculas', () => {
    expect(isLobbyRepo('AxGaldo', { name: 'Axgaldo.github.io' })).toBe(true);
    expect(isLobbyRepo('AxGaldo', { name: 'axgaldo.github.io' })).toBe(true);
    expect(isLobbyRepo('AxGaldo', { name: 'otro-repo' })).toBe(false);
  });
});

describe('repoToProject', () => {
  const repo = {
    name: 'chinese-vault',
    description: 'Aprende chino',
    html_url: 'https://github.com/AxGaldo/chinese-vault',
    homepage: null,
    pushed_at: '2026-11-19T00:45:41Z',
    language: 'TypeScript',
    topics: ['chino', 'hsk'],
  };

  it('mapea los campos del repo al formato del lobby', () => {
    const project = repoToProject('AxGaldo', repo);
    expect(project).toEqual({
      kind: 'auto',
      title: 'chinese-vault',
      description: 'Aprende chino',
      url: 'https://axgaldo.github.io/chinese-vault/',
      repoUrl: 'https://github.com/AxGaldo/chinese-vault',
      updatedAt: '2026-11-19',
      language: 'TypeScript',
      topics: ['chino', 'hsk'],
    });
  });

  it('tolera campos ausentes', () => {
    const project = repoToProject('AxGaldo', { name: 'x' });
    expect(project.description).toBe('');
    expect(project.updatedAt).toBe('');
    expect(project.language).toBe('');
    expect(project.topics).toEqual([]);
  });
});

describe('mergeProjects', () => {
  it('pone primero los manuales y después los automáticos', () => {
    const manual = { kind: 'manual', title: 'a', url: 'https://a.example/' };
    const auto = { kind: 'auto', title: 'b', url: 'https://b.example/' };
    expect(mergeProjects([manual], [auto])).toEqual([manual, auto]);
  });

  it('un manual que coincide hereda los datos del detectado y se marca fijado', () => {
    const manual = {
      kind: 'manual',
      title: 'chinese-vault',
      description: 'La mía, curada a mano',
      url: 'https://axgaldo.github.io/chinese-vault/',
    };
    const auto = {
      kind: 'auto',
      title: 'chinese-vault',
      description: 'La de la API',
      url: 'https://axgaldo.github.io/chinese-vault/',
      language: 'TypeScript',
      topics: ['hsk'],
      updatedAt: '2026-11-19',
    };
    const [merged] = mergeProjects([manual], [auto]);
    expect(merged).toMatchObject({
      kind: 'manual',
      pinned: true,
      title: 'chinese-vault',
      description: 'La mía, curada a mano',
      language: 'TypeScript',
      topics: ['hsk'],
      updatedAt: '2026-11-19',
    });
  });

  it('un manual sin par detectado no se marca como fijado', () => {
    const manual = { kind: 'manual', title: 'x', url: 'https://x.example/' };
    const [merged] = mergeProjects([manual], []);
    expect(merged.pinned).toBeUndefined();
  });

  it('deduplica por URL aunque difieran mayúsculas y barras finales', () => {
    const manual = { kind: 'manual', title: 'a', url: 'https://axgaldo.github.io/Foo/' };
    const auto = { kind: 'auto', title: 'Foo', url: 'https://axgaldo.github.io/foo' };
    const [merged] = mergeProjects([manual], [auto]);
    expect(merged).toMatchObject({ kind: 'manual', title: 'a', pinned: true });
    expect(mergeProjects([manual], [auto])).toHaveLength(1);
  });

  it('deduplica por título si no hay URL', () => {
    const manual = { kind: 'manual', title: 'Mi Proyecto' };
    const auto = { kind: 'auto', title: 'mi proyecto' };
    expect(mergeProjects([manual], [auto])).toHaveLength(1);
    expect(mergeProjects([manual], [auto])[0].kind).toBe('manual');
  });

  it('descarta entradas sin título', () => {
    expect(mergeProjects([{ title: '' }, null, { title: 'ok' }], [])).toEqual([{ title: 'ok' }]);
  });

  it('tolera listas undefined', () => {
    expect(mergeProjects(undefined, undefined)).toEqual([]);
  });
});

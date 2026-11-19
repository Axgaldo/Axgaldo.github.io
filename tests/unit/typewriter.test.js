// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Typewriter } from '../../assets/js/typewriter.js';

const makeWriter = () => {
  const root = document.createElement('div');
  const zone = document.createElement('div');
  root.appendChild(zone);
  return { root, zone, tw: new Typewriter(root) };
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Typewriter', () => {
  it('escribe línea a línea y deja el cursor al final', async () => {
    const { zone, tw } = makeWriter();
    const done = tw.typeLines(zone, [
      { segments: [{ text: 'hola' }] },
      { segments: [{ text: 'mundo' }], pause: 10 },
    ]);
    await vi.advanceTimersByTimeAsync(1000);
    await expect(done).resolves.toBe(true);
    expect(zone.textContent).toBe('holamundo');
    const cursor = zone.querySelector('.cursor');
    expect(cursor).not.toBeNull();
    expect(cursor.closest('.line')?.textContent).toBe('mundo');
  });

  it('crea enlaces para los segmentos con href', async () => {
    const { zone, tw } = makeWriter();
    const done = tw.typeLines(zone, [
      { segments: [{ text: 'github: ' }, { text: '@AxGaldo', href: 'https://github.com/AxGaldo' }] },
    ]);
    await vi.advanceTimersByTimeAsync(1000);
    await expect(done).resolves.toBe(true);
    const anchor = zone.querySelector('a.console-link');
    expect(anchor?.getAttribute('href')).toBe('https://github.com/AxGaldo');
    expect(anchor?.textContent).toBe('@AxGaldo');
  });

  it('una escritura nueva aborta la anterior', async () => {
    const { zone, tw } = makeWriter();
    const first = tw.typeLines(zone, [
      { segments: [{ text: 'texto-muy-largo-que-no-llega-al-final' }] },
    ]);
    await vi.advanceTimersByTimeAsync(30);
    const second = tw.typeLines(zone, [{ segments: [{ text: 'nuevo' }] }]);
    await vi.advanceTimersByTimeAsync(1000);
    await expect(first).resolves.toBe(false);
    await expect(second).resolves.toBe(true);
    expect(zone.textContent).toContain('nuevo');
    expect(zone.textContent).not.toContain('texto-muy-largo-que-no-llega-al-final');
  });

  it('clear vacía la zona y deja el cursor dentro', () => {
    const { zone, tw } = makeWriter();
    tw.clear(zone);
    expect(zone.children).toHaveLength(1);
    expect(zone.querySelector('.cursor')).not.toBeNull();
  });

  it('escribe al instante si el usuario prefiere menos movimiento', async () => {
    window.matchMedia = () => ({ matches: true });
    const { zone, tw } = makeWriter();
    const done = tw.typeLines(zone, [{ segments: [{ text: 'instantáneo' }] }]);
    await expect(done).resolves.toBe(true);
    expect(zone.textContent).toBe('instantáneo');
  });
});

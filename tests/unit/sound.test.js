// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Sound } from '../../assets/js/sound.js';

/** AudioContext falso: registra los nodos creados y no depende del navegador. */
function stubAudioContext() {
  const nodes = [];
  class FakeCtx {
    constructor() {
      this.state = 'running';
      this.sampleRate = 44100;
      this.destination = {};
    }

    get currentTime() {
      return 0;
    }

    createBuffer(channels, length) {
      return { getChannelData: () => new Float32Array(length) };
    }

    createBufferSource() {
      const node = {
        buffer: null,
        playbackRate: { value: 1 },
        connect: (dest) => dest,
        start: () => {},
        stop: () => {},
      };
      nodes.push(node);
      return node;
    }

    createBiquadFilter() {
      const node = {
        type: '',
        frequency: { value: 0 },
        Q: { value: 0 },
        connect: (dest) => dest,
      };
      nodes.push(node);
      return node;
    }

    createGain() {
      const node = {
        gain: {
          setValueAtTime: () => {},
          exponentialRampToValueAtTime: () => {},
        },
        connect: (dest) => dest,
      };
      nodes.push(node);
      return node;
    }

    createOscillator() {
      const node = {
        type: '',
        frequency: { setValueAtTime: () => {} },
        connect: (dest) => dest,
        start: () => {},
        stop: () => {},
      };
      nodes.push(node);
      return node;
    }

    resume() {
      return Promise.resolve();
    }
  }
  vi.stubGlobal('AudioContext', FakeCtx);
  return { nodes, FakeCtx };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Sound', () => {
  it('es seguro sin AudioContext disponible', () => {
    const sound = new Sound();
    expect(sound.enabled).toBe(true);
    expect(() => sound.unlock()).not.toThrow();
    expect(() => sound.blip()).not.toThrow();
  });

  it('crea el contexto y el ruido al desbloquear', () => {
    const { FakeCtx } = stubAudioContext();
    const sound = new Sound();
    sound.unlock();
    expect(sound.ctx).toBeInstanceOf(FakeCtx);
    expect(sound.noiseBuffer).not.toBeNull();
  });

  it('un clic monta la cadena de nodos: ruido + filtro + ganancia + cuerpo', () => {
    const { nodes } = stubAudioContext();
    const sound = new Sound();
    sound.unlock();
    sound.blip();
    // bufferSource + biquad + 2 gains + oscilador = 5 nodos mínimos
    expect(nodes.length).toBeGreaterThanOrEqual(5);
  });

  it('muteado no genera nodos', () => {
    const { nodes } = stubAudioContext();
    const sound = new Sound({ enabled: false });
    sound.unlock();
    sound.blip();
    // solo el ruido pre-generado; ningún clic
    expect(nodes.length).toBe(0);
  });
});

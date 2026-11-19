/**
 * Sonido de teletipo para la consola: clics mecánicos sintetizados
 * con Web Audio (sin ficheros). Cada tecla suena como un interruptor
 * mecánico real: una ráfaga de ruido con paso-banda agudo y
 * decaimiento casi instantáneo (el "tic" seco) más un golpe grave
 * sutil (la tecla al fondo).
 *
 * El navegador bloquea el audio hasta el primer gesto del usuario,
 * así que el AudioContext se desbloquea con cualquier clic o
 * pulsación de tecla.
 */

const NOISE_MS = 40; // duración del buffer de ruido pre-generado

export class Sound {
  /**
   * @param {{ enabled?: boolean }} [options] estado inicial.
   */
  constructor({ enabled = true } = {}) {
    this.enabled = enabled;
    this.ctx = null;
    this.noiseBuffer = null;
    this.unlock = this.unlock.bind(this);
    document.addEventListener('pointerdown', this.unlock);
    document.addEventListener('keydown', this.unlock);
  }

  /** Crea/reanuda el AudioContext tras un gesto del usuario. */
  unlock() {
    if (!this.ctx) {
      const Ctx = globalThis.AudioContext ?? globalThis.webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.ensureNoise();
  }

  /** Ruido blanco reutilizable para todos los clics. */
  ensureNoise() {
    if (!this.ctx || this.noiseBuffer) return;
    const length = Math.ceil((this.ctx.sampleRate * NOISE_MS) / 1000);
    this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const channel = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) channel[i] = Math.random() * 2 - 1;
  }

  setEnabled(value) {
    this.enabled = value;
    if (value) this.unlock();
  }

  /** Clic de tecla mecánica: ruido filtrado + golpe grave, breves. */
  blip() {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running' || !this.noiseBuffer) {
      return;
    }
    const t = this.ctx.currentTime;

    // "Tic" seco: ráfaga de ruido, aguda y casi instantánea.
    const click = this.ctx.createBufferSource();
    click.buffer = this.noiseBuffer;
    click.playbackRate.value = 0.9 + Math.random() * 0.3;
    const band = this.ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 2100 + Math.random() * 900;
    band.Q.value = 1.2;
    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.05 + Math.random() * 0.02, t);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.016);
    click.connect(band).connect(clickGain).connect(this.ctx.destination);
    click.start(t);
    click.stop(t + 0.03);

    // Cuerpo grave: la tecla golpeando el fondo, apenas audible.
    const thump = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();
    thump.type = 'triangle';
    thump.frequency.setValueAtTime(150 + Math.random() * 50, t);
    thumpGain.gain.setValueAtTime(0.01, t);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    thump.connect(thumpGain).connect(this.ctx.destination);
    thump.start(t);
    thump.stop(t + 0.04);
  }
}

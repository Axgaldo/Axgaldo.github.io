/**
 * Sonido de teletipo para la consola: blips cortos sintetizados con
 * Web Audio (sin ficheros). El navegador bloquea el audio hasta el
 * primer gesto del usuario, así que el AudioContext se desbloquea
 * con cualquier clic o pulsación de tecla.
 */

export class Sound {
  /**
   * @param {{ enabled?: boolean }} [options] estado inicial.
   */
  constructor({ enabled = true } = {}) {
    this.enabled = enabled;
    this.ctx = null;
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
  }

  setEnabled(value) {
    this.enabled = value;
    if (value) this.unlock();
  }

  /** Blip de tecla: onda cuadrada aguda y muy corta, a volumen bajo. */
  blip() {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1400 + Math.random() * 500;
    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }
}

/**
 * Motor de escritura "consola": escribe texto carácter a carácter
 * dejando siempre un cursor de bloque parpadeante al final.
 *
 * - Se puede abortar la escritura en curso (al cambiar de proyecto,
 *   la nueva escritura invalida automáticamente la anterior).
 * - Con `prefers-reduced-motion: reduce` escribe al instante.
 * - Un único cursor compartido se mueve entre las zonas de la
 *   consola (arranque y proyecto).
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * @param {HTMLElement} root contenedor donde vive el cursor compartido.
 * @param {{ baseDelay?: number, jitter?: number, onCharacter?: () => void }} [options]
 *   ritmo base (ms), variación aleatoria por carácter y callback que
 *   se dispara con cada carácter escrito (p. ej. para el sonido).
 */
export class Typewriter {
  constructor(root, { baseDelay = 10, jitter = 8, onCharacter } = {}) {
    this.baseDelay = baseDelay;
    this.jitter = jitter;
    this.onCharacter = typeof onCharacter === 'function' ? onCharacter : null;
    this.gen = 0;
    this.reduced =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia(REDUCED_MOTION).matches
        : false;
    this.cursor = document.createElement('span');
    this.cursor.className = 'cursor';
    this.cursor.setAttribute('aria-hidden', 'true');
    root.appendChild(this.cursor);
  }

  /** Invalida cualquier escritura en curso. */
  abort() {
    this.gen += 1;
  }

  /** Vacía un elemento y deja el cursor dentro, parpadeando. */
  clear(el) {
    el.replaceChildren();
    el.appendChild(this.cursor);
  }

  /**
   * Escribe un bloque de líneas en un elemento.
   *
   * @param {HTMLElement} el destino.
   * @param {Array<{ segments: Array<{ text: string, href?: string, speed?: number }>,
   *   className?: string, pause?: number }>} lines líneas a escribir.
   * @returns {Promise<boolean>} true si se completó, false si fue
   *   abortada por una escritura posterior.
   */
  async typeLines(el, lines) {
    this.abort(); // invalida escrituras previas
    const gen = this.gen;
    for (const line of lines) {
      if (this.gen !== gen) return false;
      const div = document.createElement('div');
      div.className = `line${line.className ? ` ${line.className}` : ''}`;
      el.appendChild(div);
      for (const segment of line.segments) {
        let target = div;
        if (segment.href) {
          const anchor = document.createElement('a');
          anchor.href = segment.href;
          anchor.className = 'console-link';
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
          div.appendChild(anchor);
          target = anchor;
        }
        const ok = await this._type(target, segment.text, gen, segment.speed);
        if (!ok) return false;
        div.appendChild(this.cursor);
      }
      if (line.pause && !(await this._wait(line.pause, gen))) return false;
    }
    return true;
  }

  async _type(el, text, gen, speed) {
    // Un segmento sin texto (p. ej. por un typo en data.js) no debe
    // tumbar toda la consola: se salta en silencio.
    if (typeof text !== 'string') return this.gen === gen;
    el.append(this.reduced ? text : '');
    if (this.reduced) {
      el.closest('.line')?.appendChild(this.cursor);
      return this.gen === gen;
    }
    const delay = (speed ?? this.baseDelay) + Math.random() * this.jitter;
    for (const char of text) {
      if (this.gen !== gen) return false;
      el.append(char);
      el.closest('.line')?.appendChild(this.cursor);
      this.onCharacter?.();
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return this.gen === gen;
  }

  async _wait(ms, gen) {
    await new Promise((resolve) => setTimeout(resolve, ms));
    return this.gen === gen;
  }
}

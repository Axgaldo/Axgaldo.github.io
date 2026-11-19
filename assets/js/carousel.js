/**
 * Carrusel 3D de proyectos: en escritorio es una pila vertical con
 * profundidad (tarjetas que "salen" de la pantalla); en móvil es una
 * tira horizontal con flechas.
 *
 * La geometría la calcula CSS a partir de la custom property `--d`
 * (distancia con signo al proyecto seleccionado), así el mismo DOM
 * sirve para las dos orientaciones.
 */

const VISIBLE = 2; // vecinos visibles a cada lado del seleccionado
const SWIPE_THRESHOLD = 40; // px de deslizamiento para cambiar de tarjeta

export class Carousel {
  /**
   * @param {HTMLElement} el contenedor del carrusel.
   * @param {{ onSelect?: (project: object | null, index: number) => void }} [options]
   */
  constructor(el, { onSelect } = {}) {
    this.el = el;
    this.onSelect = onSelect;
    this.projects = [];
    this.index = 0;

    el.setAttribute('role', 'listbox');
    el.setAttribute('aria-label', 'Proyectos');

    el.addEventListener('click', (event) => {
      const card = event.target.closest('[data-i]');
      if (card) this.select(Number(card.dataset.i), { focus: true });
    });

    // Rueda del ratón (escritorio): avanza hacia abajo/arriba.
    let wheelLock = 0;
    el.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
        const now = Date.now();
        if (now - wheelLock < 220) return;
        if (event.deltaY === 0) return;
        wheelLock = now;
        if (event.deltaY > 0) this.next();
        else this.prev();
      },
      { passive: false },
    );

    // Deslizamiento táctil (móvil): izquierda = siguiente.
    let startX = null;
    el.addEventListener('pointerdown', (event) => {
      startX = event.clientX;
    });
    el.addEventListener('pointerup', (event) => {
      if (startX === null) return;
      const delta = event.clientX - startX;
      startX = null;
      if (Math.abs(delta) < SWIPE_THRESHOLD) return;
      if (delta < 0) this.next();
      else this.prev();
    });
  }

  /** Sustituye la lista de proyectos y selecciona el primero. */
  setProjects(projects) {
    this.projects = projects;
    this.index = 0;
    this.el.replaceChildren(...projects.map((project, i) => this._buildCard(project, i)));
    if (projects.length) this.select(0);
    else this.onSelect?.(null, -1);
  }

  _buildCard(project, i) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.i = String(i);
    card.setAttribute('role', 'option');
    card.setAttribute('aria-selected', 'false');
    card.tabIndex = i === 0 ? 0 : -1;

    const idx = document.createElement('span');
    idx.className = 'card-idx';
    idx.textContent = `${String(i + 1).padStart(2, '0')}`;

    const title = document.createElement('span');
    title.className = 'card-title';
    title.textContent = project.title;

    const desc = document.createElement('span');
    desc.className = 'card-desc';
    desc.textContent =
      project.description ||
      (project.kind === 'manual' ? 'proyecto personal' : 'github pages');

    const badge = document.createElement('span');
    badge.className = 'card-badge';
    badge.textContent = project.kind === 'manual' ? 'MANUAL' : 'AUTO';

    const inner = document.createElement('span');
    inner.className = 'card-inner';
    inner.append(idx, title, desc, badge);
    card.appendChild(inner);
    return card;
  }

  /**
   * Selecciona un proyecto (con wrap-around).
   * @param {number} i índice objetivo.
   * @param {{ focus?: boolean }} [options] enfoca la tarjeta
   *   seleccionada (para navegación por teclado).
   */
  select(i, { focus = false } = {}) {
    const n = this.projects.length;
    if (!n) return;
    this.index = ((i % n) + n) % n;
    [...this.el.children].forEach((card, ci) => {
      const distance = ci - this.index;
      const selected = distance === 0;
      card.style.setProperty('--d', String(distance));
      card.classList.toggle('selected', selected);
      card.classList.toggle('far', Math.abs(distance) > VISIBLE);
      card.setAttribute('aria-selected', selected ? 'true' : 'false');
      card.tabIndex = selected ? 0 : -1;
      if (selected && focus) card.focus();
    });
    this.onSelect?.(this.projects[this.index], this.index);
  }

  next() {
    this.select(this.index + 1);
  }

  prev() {
    this.select(this.index - 1);
  }
}

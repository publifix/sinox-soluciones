(function () {
  var heroEl = document.querySelector('[data-hero]');
  if (!heroEl) return;

  var slides = Array.prototype.slice.call(heroEl.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(heroEl.querySelectorAll('[data-hero-dot]'));
  var panel = heroEl.querySelector('[data-hero-panel]');
  var eyebrowEl = panel.querySelector('[data-hero-eyebrow]');
  var titleEl = panel.querySelector('[data-hero-title]');
  var descEl = panel.querySelector('[data-hero-description]');
  var ctaPrimaryEl = panel.querySelector('[data-hero-cta-primary]');
  var ctaSecondaryEl = panel.querySelector('[data-hero-cta-secondary]');
  var counterCurrentEl = heroEl.querySelector('[data-hero-counter-current]');
  var playPauseBtn = heroEl.querySelector('[data-hero-playpause]');

  if (!slides.length || !dots.length || !panel) return;

  var INTERVAL_MS = 6000;
  heroEl.style.setProperty('--hero-interval', INTERVAL_MS + 'ms');

  var content = [
    {
      eyebrow: 'SINOX Soluciones · Querétaro',
      title: 'Limpieza industrial para operaciones que no pueden fallar',
      description:
        'Protegemos la continuidad operativa de plantas, corredores logísticos e instalaciones críticas con estándares de precisión propios de la industria aeroespacial.',
      ctaPrimary: { label: 'Conoce SINOX', href: '#nosotros' },
      ctaSecondary: { label: 'Ver servicios', href: '#servicios' },
    },
    {
      eyebrow: 'Misión crítica · Data centers',
      title: 'Protocolos de limpieza certificados para entornos de misión crítica',
      description:
        'Salas blancas, pisos elevados y racks activos: operamos bajo protocolos ISO y ESD diseñados para infraestructura que exige cero tolerancia a errores.',
      ctaPrimary: { label: 'Soluciones para Data Centers', href: '#sectores' },
      ctaSecondary: { label: 'Hablar con un especialista', href: '#contacto' },
    },
    {
      eyebrow: 'Confianza comprobada',
      title: 'La confianza de las marcas más exigentes del mundo',
      description:
        'Airbus, Bombardier y Equinix respaldan nuestro trabajo día a día. Un historial construido sobre consistencia, cumplimiento y resultados medibles.',
      ctaPrimary: { label: 'Ver casos de éxito', href: '#clientes' },
      ctaSecondary: { label: 'Contáctanos', href: '#contacto' },
    },
  ];

  var index = 0;
  var timer = null;
  var hoverPaused = false;
  var manualPaused = false;

  function renderContent(i) {
    var c = content[i];
    if (!c) return;
    eyebrowEl.textContent = c.eyebrow;
    titleEl.textContent = c.title;
    descEl.textContent = c.description;
    ctaPrimaryEl.textContent = c.ctaPrimary.label;
    ctaPrimaryEl.setAttribute('href', c.ctaPrimary.href);
    ctaSecondaryEl.textContent = c.ctaSecondary.label;
    ctaSecondaryEl.setAttribute('href', c.ctaSecondary.href);

    panel.classList.remove('is-animating');
    // force reflow so the entrance animation replays on every rotation
    void panel.offsetWidth;
    panel.classList.add('is-animating');
  }

  function setActive(nextIndex) {
    slides[index].classList.remove('is-active');
    dots[index].classList.remove('is-active');
    dots[index].removeAttribute('aria-current');

    index = nextIndex;

    slides[index].classList.add('is-active');
    dots[index].classList.add('is-active');
    dots[index].setAttribute('aria-current', 'true');
    counterCurrentEl.textContent = String(index + 1).padStart(2, '0');
    renderContent(index);
  }

  function goTo(nextIndex) {
    var normalized = ((nextIndex % slides.length) + slides.length) % slides.length;
    if (normalized === index) return;
    setActive(normalized);
    restartTimer();
  }

  function advance() {
    setActive((index + 1) % slides.length);
  }

  function isPaused() {
    return hoverPaused || manualPaused;
  }

  function restartTimer() {
    if (timer) clearInterval(timer);
    timer = null;
    if (isPaused()) return;
    timer = setInterval(advance, INTERVAL_MS);
  }

  function syncPausedState() {
    heroEl.classList.toggle('is-paused', isPaused());
    restartTimer();
  }

  // Only pause on hover over the readable/interactive chrome (text panel +
  // controls), not the full-bleed photo -- the hero fills most of the
  // viewport, so pausing on hover anywhere in it would leave it paused
  // for almost any visitor with a mouse resting over the page.
  var hoverZones = [panel, heroEl.querySelector('[data-hero-controls]')].filter(Boolean);

  hoverZones.forEach(function (zone) {
    zone.addEventListener('mouseenter', function () {
      hoverPaused = true;
      syncPausedState();
    });

    zone.addEventListener('mouseleave', function () {
      hoverPaused = false;
      syncPausedState();
    });
  });

  heroEl.addEventListener('focusin', function () {
    hoverPaused = true;
    syncPausedState();
  });

  heroEl.addEventListener('focusout', function (event) {
    if (heroEl.contains(event.relatedTarget)) return;
    hoverPaused = false;
    syncPausedState();
  });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      goTo(i);
    });
  });

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', function () {
      manualPaused = !manualPaused;
      playPauseBtn.setAttribute('aria-pressed', String(manualPaused));
      playPauseBtn.setAttribute(
        'aria-label',
        manualPaused ? 'Reanudar rotación automática' : 'Pausar rotación automática'
      );
      heroEl.classList.toggle('is-manually-paused', manualPaused);
      syncPausedState();
    });
  }

  renderContent(index);
  restartTimer();
})();

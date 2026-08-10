(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Generic pointer drag-to-scroll for horizontal carousels. Touch
     already scrolls natively via overflow-x, so this only binds mouse. ---- */
  function enableDragScroll(track) {
    if (!track) return;
    var isDown = false;
    var startX = 0;
    var startScroll = 0;

    track.addEventListener('pointerdown', function (event) {
      if (event.pointerType !== 'mouse') return;
      isDown = true;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener('pointermove', function (event) {
      if (!isDown) return;
      track.scrollLeft = startScroll - (event.clientX - startX);
    });

    function endDrag() {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('is-dragging');
    }

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    track.addEventListener('pointerleave', endDrag);
  }

  /* ==========================================================================
     Narrative: sticky horizontal scroll-jack on desktop, native swipe on
     mobile/touch and under prefers-reduced-motion. Re-evaluated on resize so
     rotating a tablet or resizing a desktop window switches mode cleanly.
     ========================================================================== */
  (function narrativeScrollJack() {
    var narrative = document.querySelector('[data-narrative]');
    if (!narrative) return;

    var track = narrative.querySelector('[data-narrative-track]');
    var panels = Array.prototype.slice.call(track.children);
    if (panels.length < 2) return;

    var desktopQuery = window.matchMedia('(min-width: 900px)');
    var active = false;
    var ticking = false;

    function setHeight() {
      narrative.style.height = window.innerHeight * panels.length + 'px';
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        if (!active) return;
        var rect = narrative.getBoundingClientRect();
        var total = rect.height - window.innerHeight;
        if (total <= 0) return;
        var progress = Math.min(Math.max(-rect.top / total, 0), 1);
        var maxTranslate = (panels.length - 1) * 100;
        track.style.transform = 'translateX(-' + progress * maxTranslate + '%)';
      });
    }

    function activate() {
      if (active) return;
      active = true;
      narrative.classList.add('is-scrolljacked');
      setHeight();
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    function deactivate() {
      if (!active) return;
      active = false;
      narrative.classList.remove('is-scrolljacked');
      window.removeEventListener('scroll', onScroll);
      narrative.style.height = '';
      track.style.transform = '';
    }

    function evaluateMode() {
      if (!reduceMotion && desktopQuery.matches) {
        activate();
      } else {
        deactivate();
      }
    }

    evaluateMode();
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', evaluateMode);
    }

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        evaluateMode();
        if (active) setHeight();
      }, 150);
    });
  })();

  /* ---- Highlights carousel: just needs desktop drag-to-scroll. ---- */
  enableDragScroll(document.querySelector('[data-highlights-track]'));

  /* ==========================================================================
     Related services: rendered from the shared catalog, excluding the
     current page's own service, so the next 8 pages get this for free.
     ========================================================================== */
  (function renderRelatedServices() {
    var track = document.querySelector('[data-related-track]');
    var catalog = window.SINOX_SERVICES_CATALOG;
    if (!track || !catalog) return;

    var currentSlug = document.body.getAttribute('data-service');
    var items = catalog.filter(function (service) {
      return service.slug !== currentSlug;
    });

    items.forEach(function (service) {
      var card = document.createElement('a');
      card.className = 'related-card';
      card.href = service.href;

      var picture = document.createElement('picture');
      var source = document.createElement('source');
      source.type = 'image/webp';
      source.srcset =
        'assets/img/services/' + service.image + '-480.webp 480w, ' +
        'assets/img/services/' + service.image + '-800.webp 800w, ' +
        'assets/img/services/' + service.image + '-1200.webp 1200w';
      source.sizes = '(min-width: 1024px) 26vw, (min-width: 640px) 42vw, 68vw';

      var img = document.createElement('img');
      img.className = 'related-card__img';
      img.src = 'assets/img/services/' + service.image + '-800.jpg';
      img.alt = '';
      img.width = 800;
      img.height = 1000;
      img.loading = 'lazy';
      img.decoding = 'async';

      picture.appendChild(source);
      picture.appendChild(img);

      var scrim = document.createElement('div');
      scrim.className = 'related-card__scrim';

      var title = document.createElement('span');
      title.className = 'related-card__title';
      title.textContent = service.name;

      card.appendChild(picture);
      card.appendChild(scrim);
      card.appendChild(title);
      track.appendChild(card);
    });

    enableDragScroll(track);
  })();

  /* ---- Preselect the reused contact form's service dropdown. ---- */
  (function preselectService() {
    var select = document.querySelector('select[name="service"]');
    var catalog = window.SINOX_SERVICES_CATALOG;
    if (!select || !catalog) return;

    var currentSlug = document.body.getAttribute('data-service');
    var current = catalog.filter(function (service) {
      return service.slug === currentSlug;
    })[0];
    if (!current) return;

    Array.prototype.forEach.call(select.options, function (option) {
      option.selected = option.textContent.trim() === current.name;
    });
  })();
})();

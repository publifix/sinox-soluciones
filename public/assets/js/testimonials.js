(function () {
  var root = document.querySelector('[data-testimonials]');
  if (!root) return;

  var track = root.querySelector('[data-carousel-track]');
  var slides = Array.prototype.slice.call(root.querySelectorAll('[data-carousel-slide]'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('[data-carousel-dot]'));
  var prevBtn = root.querySelector('[data-carousel-prev]');
  var nextBtn = root.querySelector('[data-carousel-next]');
  var statusEl = root.querySelector('[data-carousel-status]');

  if (!track || !slides.length || !dots.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INTERVAL_MS = 6000;
  var RESUME_DELAY_MS = 5000;

  var index = 0;
  var timer = null;
  var resumeTimer = null;
  var hoverPaused = false;
  var interactionPaused = false;

  function isPaused() {
    return hoverPaused || interactionPaused;
  }

  function restartTimer() {
    if (timer) clearInterval(timer);
    timer = null;
    if (reduceMotion || isPaused()) return;
    timer = setInterval(advance, INTERVAL_MS);
  }

  function syncPausedState() {
    root.classList.toggle('is-paused', isPaused());
    restartTimer();
  }

  function markInteraction() {
    interactionPaused = true;
    root.classList.add('is-paused');
    if (timer) clearInterval(timer);
    timer = null;
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () {
      interactionPaused = false;
      syncPausedState();
    }, RESUME_DELAY_MS);
  }

  function setActiveIndex(i) {
    if (i === index && dots[i].classList.contains('is-active')) return;
    dots[index].classList.remove('is-active');
    dots[index].removeAttribute('aria-current');

    index = i;

    dots[index].classList.add('is-active');
    dots[index].setAttribute('aria-current', 'true');
    if (statusEl) {
      statusEl.textContent = 'Testimonio ' + (index + 1) + ' de ' + slides.length;
    }
  }

  function goTo(i) {
    var normalized = ((i % slides.length) + slides.length) % slides.length;
    slides[normalized].scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    });
    setActiveIndex(normalized);
  }

  function advance() {
    goTo(index + 1);
  }

  // Keeps dots in sync with manual swipe/drag too, not just programmatic nav.
  // A callback only reports entries whose ratio crossed a threshold since
  // the last one, so we track every slide's latest known ratio persistently
  // rather than comparing within a single batch -- otherwise a multi-slide
  // jump (e.g. dot 1 -> dot 3) can settle on the wrong slide if the final
  // resting callback happens not to include every slide.
  var ratios = slides.map(function () {
    return 0;
  });
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var i = slides.indexOf(entry.target);
        if (i !== -1) ratios[i] = entry.intersectionRatio;
      });
      var bestIndex = 0;
      for (var j = 1; j < ratios.length; j++) {
        if (ratios[j] > ratios[bestIndex]) bestIndex = j;
      }
      if (ratios[bestIndex] > 0.6) setActiveIndex(bestIndex);
    },
    { root: track, threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] }
  );
  slides.forEach(function (slide) {
    observer.observe(slide);
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      markInteraction();
      goTo(index - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      markInteraction();
      goTo(index + 1);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      markInteraction();
      goTo(i);
    });
  });

  root.addEventListener('mouseenter', function () {
    hoverPaused = true;
    syncPausedState();
  });
  root.addEventListener('mouseleave', function () {
    hoverPaused = false;
    syncPausedState();
  });

  root.addEventListener('focusin', function () {
    hoverPaused = true;
    syncPausedState();
  });
  root.addEventListener('focusout', function (event) {
    if (root.contains(event.relatedTarget)) return;
    hoverPaused = false;
    syncPausedState();
  });

  // Click-and-drag on desktop -- touch already scrolls natively via
  // overflow-x, so this only binds for mouse pointers.
  var isDragging = false;
  var dragStartX = 0;
  var dragStartScroll = 0;

  track.addEventListener('pointerdown', function (event) {
    if (event.pointerType !== 'mouse') return;
    isDragging = true;
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    track.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
    markInteraction();
  });

  track.addEventListener('pointermove', function (event) {
    if (!isDragging) return;
    var dx = event.clientX - dragStartX;
    track.scrollLeft = dragStartScroll - dx;
  });

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('is-dragging');
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('pointerleave', endDrag);

  // Native touch swipe / wheel scroll should also count as manual
  // interaction so autoplay doesn't fight the user mid-gesture.
  track.addEventListener('touchstart', markInteraction, { passive: true });
  track.addEventListener('wheel', markInteraction, { passive: true });

  dots[0].classList.add('is-active');
  dots[0].setAttribute('aria-current', 'true');
  restartTimer();
})();

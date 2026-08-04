(function () {
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (!revealEls.length) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setFinalCounterValue(el) {
    var target = parseFloat(el.getAttribute('data-count-to'), 10);
    if (!isNaN(target)) el.textContent = String(Math.round(target));
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count-to'), 10);
    if (isNaN(target)) return;
    var duration = 1600;
    var start = null;

    el.textContent = '0';

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = String(Math.round(target));
      }
    }

    window.requestAnimationFrame(step);
  }

  // Once the entrance transition finishes, drop the [data-reveal] attribute
  // so its CSS (opacity/transform: none) stops applying. Without this, the
  // reveal rule's specificity permanently wins over a component's own hover
  // transform (e.g. the model cards' lift-on-hover) even after reveal ends.
  function releaseAfterTransition(el) {
    var released = false;
    var release = function () {
      if (released) return;
      released = true;
      el.removeAttribute('data-reveal');
      el.removeEventListener('transitionend', onEnd);
    };
    var onEnd = function (event) {
      if (event.target === el) release();
    };
    el.addEventListener('transitionend', onEnd);
    // Safety net in case the transition never fires (e.g. element already
    // matched final state, or a browser quirk swallows the event).
    window.setTimeout(release, 900);
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) {
      el.classList.add('is-revealed');
      el.removeAttribute('data-reveal');
      var counters = el.hasAttribute('data-count-to') ? [el] : el.querySelectorAll('[data-count-to]');
      Array.prototype.forEach.call(counters, setFinalCounterValue);
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-revealed');
        releaseAfterTransition(el);

        var counters = el.hasAttribute('data-count-to') ? [el] : el.querySelectorAll('[data-count-to]');
        Array.prototype.forEach.call(counters, animateCounter);

        obs.unobserve(el);
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });
})();

(function () {
  var section = document.querySelector('[data-model]');
  var video = document.querySelector('[data-model-video]');
  if (!section || !video) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function play() {
    if (reduceMotion) return;
    var attempt = video.play();
    if (attempt && attempt.catch) {
      attempt.catch(function () {
        /* autoplay blocked by the browser; the poster frame stays visible */
      });
    }
  }

  function pause() {
    video.pause();
  }

  if (reduceMotion) return;

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            play();
          } else {
            pause();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(section);
  } else {
    play();
  }
})();

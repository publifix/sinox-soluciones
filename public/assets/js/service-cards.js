(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.service-card'));
  if (!cards.length) return;

  var isTouch = window.matchMedia('(hover: none)').matches;
  if (!isTouch) return;

  function deactivateOthers(except) {
    cards.forEach(function (card) {
      if (card !== except) card.classList.remove('is-active');
    });
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function (event) {
      if (!card.classList.contains('is-active')) {
        event.preventDefault();
        deactivateOthers(card);
        card.classList.add('is-active');
      }
    });
  });

  document.addEventListener('click', function (event) {
    if (event.target.closest('.service-card')) return;
    deactivateOthers(null);
  });
})();

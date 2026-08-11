(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-accordion-item]'));
  if (!items.length) return;

  function setState(item, isOpen) {
    item.classList.toggle('is-open', isOpen);
    var trigger = item.querySelector('[data-accordion-trigger]');
    if (trigger) trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  items.forEach(function (item) {
    var trigger = item.querySelector('[data-accordion-trigger]');
    if (!trigger) return;

    trigger.addEventListener('click', function () {
      var wasOpen = item.classList.contains('is-open');
      items.forEach(function (other) {
        setState(other, false);
      });
      setState(item, !wasOpen);
    });
  });
})();

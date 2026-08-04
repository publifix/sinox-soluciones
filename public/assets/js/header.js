(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-nav]');
  if (!toggle || !panel) return;

  var desktopQuery = window.matchMedia('(min-width: 900px)');

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    panel.style.maxHeight = '0px';
  }

  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    panel.classList.add('is-open');
    panel.style.maxHeight = panel.scrollHeight + 'px';
  }

  toggle.addEventListener('click', function () {
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  panel.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  desktopQuery.addEventListener('change', function (event) {
    if (event.matches) closeMenu();
  });

  window.addEventListener('resize', function () {
    if (toggle.getAttribute('aria-expanded') === 'true') {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
})();

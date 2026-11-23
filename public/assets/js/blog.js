(function () {
  var catalog = window.SINOX_ARTICLES_CATALOG || [];

  function sortedByDateDesc(list) {
    return list.slice().sort(function (a, b) {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });
  }

  function buildCard(article, options) {
    options = options || {};

    var card = document.createElement('a');
    card.className = 'blog-card' + (options.featured ? ' blog-card--featured' : '');
    card.href = article.href;
    if (article.categorySlug) {
      card.setAttribute('data-category', article.categorySlug);
    }

    var category = document.createElement('span');
    category.className = 'blog-card__category';
    category.textContent = article.category;

    var title = document.createElement('h3');
    title.className = 'blog-card__title';
    title.textContent = article.title;

    var excerpt = document.createElement('p');
    excerpt.className = 'blog-card__excerpt';
    excerpt.textContent = article.excerpt;

    var meta = document.createElement('span');
    meta.className = 'blog-card__meta';
    meta.textContent = article.dateDisplay + ' · ' + article.readingMinutes + ' min de lectura';

    card.appendChild(category);
    card.appendChild(title);
    card.appendChild(excerpt);
    card.appendChild(meta);
    return card;
  }

  /* ==========================================================================
     Home teaser: latest 3 articles.
     ========================================================================== */
  (function renderHomeTeaser() {
    var track = document.querySelector('[data-blog-teaser-track]');
    if (!track || !catalog.length) return;

    sortedByDateDesc(catalog)
      .slice(0, 3)
      .forEach(function (article) {
        track.appendChild(buildCard(article));
      });
  })();

  /* ==========================================================================
     Blog listing: featured slot for the latest article, grid for the rest,
     plus category filter pills that show/hide grid cards in place.
     ========================================================================== */
  (function renderBlogListing() {
    var grid = document.querySelector('[data-blog-grid]');
    if (!grid || !catalog.length) return;

    var ordered = sortedByDateDesc(catalog);
    var featuredSlot = document.querySelector('[data-blog-featured]');

    var rest = ordered;
    if (featuredSlot) {
      featuredSlot.appendChild(buildCard(ordered[0], { featured: true }));
      rest = ordered.slice(1);
    }

    rest.forEach(function (article) {
      grid.appendChild(buildCard(article));
    });

    var filterBar = document.querySelector('[data-blog-filters]');
    if (!filterBar) return;

    var buttons = Array.prototype.slice.call(filterBar.querySelectorAll('[data-blog-filter]'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.blog-card'));

    function applyFilter(categorySlug) {
      cards.forEach(function (card) {
        var matches = categorySlug === 'all' || card.getAttribute('data-category') === categorySlug;
        card.hidden = !matches;
      });
      buttons.forEach(function (button) {
        var isActive = button.getAttribute('data-blog-filter') === categorySlug;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        applyFilter(button.getAttribute('data-blog-filter'));
      });
    });
  })();

  /* ==========================================================================
     Article page: "Artículos relacionados", same category first, excluding
     the current article. Falls back to hiding the block entirely while the
     catalog is still too small to fill it.
     ========================================================================== */
  (function renderRelatedArticles() {
    var section = document.querySelector('[data-related-articles]');
    var track = document.querySelector('[data-related-articles-track]');
    if (!section || !track) return;

    var currentSlug = document.body.getAttribute('data-article');
    var others = catalog.filter(function (article) {
      return article.slug !== currentSlug;
    });

    if (!others.length) {
      section.hidden = true;
      return;
    }

    var currentCategory = catalog.filter(function (article) {
      return article.slug === currentSlug;
    })[0];
    currentCategory = currentCategory ? currentCategory.categorySlug : null;

    var sameCategory = others.filter(function (article) {
      return article.categorySlug === currentCategory;
    });
    var otherCategory = others.filter(function (article) {
      return article.categorySlug !== currentCategory;
    });

    sameCategory
      .concat(otherCategory)
      .slice(0, 3)
      .forEach(function (article) {
        track.appendChild(buildCard(article));
      });
  })();
})();

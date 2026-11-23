/* Shared source of truth for the blog -- used to render the Home teaser,
   the /blog listing grid, its category filters, and each article's
   "Artículos relacionados" block. Add a new object here each time an
   article is published; nothing else needs to be hand-edited to make it
   show up everywhere it should. Keep `category`/`categorySlug` in sync
   with the service lines in services-catalog.js so cross-linking stays
   consistent. `href` is root-relative (works the same from any page, any
   nesting depth) and should match the article's own folder: each article
   lives at /blog/<slug>/index.html so it serves at a clean /blog/<slug>/
   URL with no .html in it. */
window.SINOX_ARTICLES_CATALOG = [
  {
    slug: 'como-elegir-proveedor-limpieza-industrial-queretaro',
    title: 'Cómo elegir un proveedor de limpieza industrial en Querétaro: checklist de 10 puntos antes de contratar',
    excerpt:
      'Qué preguntar antes de firmar con un proveedor de limpieza industrial: personal, protocolos, cumplimiento normativo y evidencia de servicio.',
    category: 'Limpieza Industrial',
    categorySlug: 'limpieza-industrial',
    date: '2026-11-23',
    dateDisplay: '23 de noviembre de 2026',
    readingMinutes: 9,
    href: '/blog/como-elegir-proveedor-limpieza-industrial-queretaro/',
  },
  {
    slug: 'limpieza-data-centers-protocolo-proveedor',
    title: 'Limpieza de data centers: qué debe incluir el protocolo de tu proveedor',
    excerpt:
      'Por qué un data center no se limpia como una planta industrial: control de partículas, descarga electrostática, productos no corrosivos y acceso documentado.',
    category: 'Limpieza de Data Centers',
    categorySlug: 'limpieza-data-centers',
    date: '2026-11-30',
    dateDisplay: '30 de noviembre de 2026',
    readingMinutes: 8,
    href: '/blog/limpieza-data-centers-protocolo-proveedor/',
  },
  {
    slug: 'control-fod-limpieza-aeroespacial-queretaro',
    title: 'Control de FOD en plantas aeroespaciales: qué debe garantizar tu proveedor de limpieza',
    excerpt:
      'Qué es el FOD, por qué es el centro de la limpieza aeroespacial y qué debe incluir un protocolo que controle herramientas, materiales y zonas críticas.',
    category: 'Limpieza Aeroespacial',
    categorySlug: 'limpieza-aeroespacial',
    date: '2026-12-07',
    dateDisplay: '7 de diciembre de 2026',
    readingMinutes: 8,
    href: '/blog/control-fod-limpieza-aeroespacial-queretaro/',
  },
];

/* Shared source of truth for the 9 service lines -- used by service page
   templates to render "Servicios relacionados" and to preselect the
   contact form's "Servicio de interés" option. Keep display names in sync
   with the <select> options in the reused CTA block and with the Home
   services grid titles. */
window.SINOX_SERVICES_CATALOG = [
  {
    slug: 'limpieza-industrial',
    name: 'Limpieza Industrial',
    image: 'servicio-limpieza-industrial',
    href: 'servicio-limpieza-industrial.html',
  },
  {
    slug: 'limpieza-data-centers',
    name: 'Limpieza de Data Centers',
    image: 'servicio-limpieza-data-centers',
    href: 'servicio-limpieza-data-centers.html',
  },
  {
    slug: 'limpieza-aeroespacial',
    name: 'Limpieza Aeroespacial',
    image: 'servicio-limpieza-aeroespacial',
    href: 'servicio-limpieza-aeroespacial.html',
  },
  {
    slug: 'mantenimiento-industrial',
    name: 'Mantenimiento Industrial',
    image: 'servicio-mantenimiento-industrial',
    href: 'servicio-mantenimiento-industrial.html',
  },
  {
    slug: 'fumigacion-control-plagas',
    name: 'Fumigación y Control de Plagas',
    image: 'servicio-fumigacion-control-plagas',
    href: 'servicio-fumigacion-control-plagas.html',
  },
  {
    slug: 'jardineria-industrial-corporativa',
    name: 'Jardinería Industrial y Corporativa',
    image: 'servicio-jardineria-industrial-corporativa',
    href: 'servicio-jardineria-industrial-corporativa.html',
  },
  {
    slug: 'mantenimiento-integral-oficinas',
    name: 'Mantenimiento Integral para Oficinas',
    image: 'servicio-mantenimiento-integral-oficinas',
    href: 'servicio-mantenimiento-integral-oficinas.html',
  },
  {
    slug: 'comercializadora-insumos',
    name: 'Comercializadora de Insumos',
    image: 'servicio-comercializadora-insumos',
    href: 'servicio-comercializadora-insumos.html',
  },
  {
    slug: 'lavado-tapiceria',
    name: 'Lavado de Tapicería',
    image: 'servicio-lavado-tapiceria',
    href: 'servicio-lavado-tapiceria.html',
  },
];

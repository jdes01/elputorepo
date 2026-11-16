// Las capas de cada modulo, comprobadas en cada push (task deps:check).
//
//   domain          <- application <- infrastructure
//   (nada de fuera)    (puertos)       (adaptadores, Nest, drizzle, SMTP)
//
// Los tests quedan fuera: un test de un caso de uso monta adaptadores en memoria.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-sin-dependencias',
      comment: 'El dominio no conoce ni casos de uso, ni adaptadores, ni ningun paquete de npm.',
      severity: 'error',
      from: { path: '/domain/', pathNot: '\\.test\\.ts$' },
      to: { path: ['/application/', '/infrastructure/'] },
    },
    {
      name: 'domain-sin-paquetes',
      comment: 'El dominio es TypeScript puro.',
      severity: 'error',
      from: { path: '/domain/', pathNot: '\\.test\\.ts$' },
      to: { dependencyTypes: ['npm', 'npm-dev'] },
    },
    {
      name: 'application-sin-adaptadores',
      comment: 'Los casos de uso piden puertos; quien pone los adaptadores es la infraestructura.',
      severity: 'error',
      from: { path: '/application/', pathNot: '\\.test\\.ts$' },
      to: { path: '/infrastructure/' },
    },
    {
      name: 'application-sin-paquetes',
      comment: 'Solo @nestjs/common, por @Injectable. Nada de drizzle, pg ni nodemailer.',
      severity: 'error',
      from: { path: '/application/', pathNot: '\\.test\\.ts$' },
      to: { dependencyTypes: ['npm', 'npm-dev'], pathNot: '@nestjs/common' },
    },
  ],
  options: {
    tsConfig: { fileName: 'apps/padel/backend/tsconfig.json' },
    doNotFollow: { path: 'node_modules' },
  },
};

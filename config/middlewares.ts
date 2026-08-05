import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            'res.cloudinary.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'https://burooj.pro',
        'https://buroojair.com',
        'https://naqsh.com',
        'https://6degrees.com.sa',
        'https://efficiencys.com.sa',
        'https://naqsh-holding.github.io',
      ],
      headers: '*',
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '500mb',
      jsonLimit: '500mb',
      textLimit: '500mb',
      formidable: {
        maxFileSize: 500 * 1024 * 1024, // 500MB
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
import type {Core} from '@strapi/strapi';

const config = ({env}: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    url: env('PUBLIC_URL', 'https://strapi.6d.com.sa'),
    app: {
        keys: env.array('APP_KEYS')!,
    },
    webhooks: {
        populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
});

export default config;
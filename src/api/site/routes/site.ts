export default {
    routes: [
        {
            method: 'GET',
            path: '/site-full',
            handler: 'site.full',
            config: {
                auth: false,
            },
        },
    ],
};

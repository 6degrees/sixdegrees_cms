import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::site.site', ({ strapi }) => ({

  async full(ctx) {
   

    const site = await strapi.entityService.findMany('api::site.site', {
 
      populate: {
        pages: {
          populate: {
            sections: {
              on: {
                'sections.project': {
                  populate: '*',
                },
              },
            },
          },
        },
      },
    } as any);

    ctx.body = site?.[0] ?? null;
  },

}));
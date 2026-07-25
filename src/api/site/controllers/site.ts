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
                  populate: {
                    background: true,
                    thumbnail: true,
                    swiber: true,
                    category: true,
                    industry: true,
                    cards: {
                      populate: {
                        images: true
                      }
                    }
                  }
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
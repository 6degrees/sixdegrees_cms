import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::site.site', ({ strapi }) => ({

  async full(ctx) {
    const { slug } = ctx.query;

    const allSites = await strapi.entityService.findMany('api::site.site', {
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
                'burooj.project': {
                  populate: {
                    background: true,
                    thumbnail: true,
                    services: true,
                    cards: {
                      populate: {
                        images: true
                      }
                    }
                  }
                },
                'air.projects-grid': {
                  populate: {
                    projects: {
                      populate: {
                        media: true
                      }
                    }
                  }
                },
                'ec.spaces-grid': {
                  populate: {
                    spaces: {
                      populate: {
                        image: true
                      }
                    }
                  }
                },
                'ec.events-grid': {
                  populate: {
                    events: {
                      populate: {
                        media: true
                      }
                    }
                  }
                },
                'ec.clients-grid': {
                  populate: {
                    clients: {
                      populate: {
                        logo: true
                      }
                    }
                  }
                },
                'ec.reviews-grid': {
                  populate: {
                    reviews: true
                  }
                },
                'naqsh.naqsh-project': {
                  populate: {
                    background: true,
                    thumbnail: true,
                    swiper: true,
                    tags: true,
                    sub_sections: {
                      populate: {
                        images: true
                      }
                    }
                  }
                },
                'naqsh.naqsh-news': {
                  populate: {
                    cover_image: true,
                    tags: true
                  }
                },
              },
            },
          },
        },
      },
    } as any);

    const site = (allSites as any[]).find((s) => s.slag === slug);

    ctx.body = site ?? null;
  },

}));
import { factories } from '@strapi/strapi';

const sectionsPopulate = {
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
};

export default factories.createCoreController('api::site.site', ({ strapi }) => ({

  async full(ctx) {
    const { slug, documentId, status } = ctx.query as {
      slug?: string;
      documentId?: string;
      status?: string;
    };

    // وضع المعاينة: صفحة بعينها (مسودة أو منشورة) عبر documentId
    if (documentId) {
      const page = await strapi.documents('api::page.page' as any).findOne({
        documentId,
        status: status === 'published' ? 'published' : 'draft',
        populate: {
          site: true,
          sections: {
            on: sectionsPopulate,
          },
        },
      } as any);

      if (!page) {
        ctx.body = null;
        return;
      }

      const site = (page as any).site;
      ctx.body = site ? { ...site, pages: [page] } : null;
      return;
    }

    // الوضع العادي: كل مواقع الشركة المنشورة، نلقط فيها بالـ slug
    const allSites = await strapi.entityService.findMany('api::site.site', {
      populate: {
        pages: {
          populate: {
            sections: {
              on: sectionsPopulate,
            },
          },
        },
      },
    } as any);

    const site = (allSites as any[]).find((s) => s.slag === slug);

    ctx.body = site ?? null;
  },

}));
import type { Core } from '@strapi/strapi';
import jwt from 'jsonwebtoken';

// خريطة preferedLanguage → رقم فولدر مكتبة الوسائط لكل شركة
const SITE_TO_MEDIA_FOLDER: Record<string, number> = {
  burooj_home: 2,
  air_home: 4,
  naqsh_home: 3,
  ec_home: 5,
  '6D_home': 1,
};

// نفس القيم المسموحة تُستخدم أيضًا عند تعيين شركة لموظف عبر الودجت
const VALID_SITE_VALUES = Object.keys(SITE_TO_MEDIA_FOLDER);

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // route مخصص: تعيين preferedLanguage (شركة) لأي مستخدم أدمن - سوبر أدمن بس يقدر يستخدمه
    strapi.server.routes([
      {
        method: 'POST',
        path: '/naqsh/assign-site',
        handler: async (ctx) => {
          try {
            const authHeader = ctx.request.header.authorization;
            const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

            if (!token) {
              return ctx.unauthorized('Missing token');
            }

            const secret = strapi.config.get('admin.auth.secret') as string;
            const payload = jwt.verify(token, secret) as any;
            const requesterId = payload?.id ?? payload?.userId ?? payload?.sub;

            const requester = await strapi.db.query('admin::user').findOne({
              where: { id: requesterId },
              populate: ['roles'],
            });

            const isSuperAdmin = requester?.roles?.some(
              (r: any) => r.code === 'strapi-super-admin'
            );

            if (!requester || !isSuperAdmin) {
              return ctx.forbidden('Super Admin only');
            }

            const { userId, site } = ctx.request.body as { userId?: number; site?: string };

            if (!userId || !site) {
              return ctx.badRequest('userId and site are required');
            }

            if (!VALID_SITE_VALUES.includes(site)) {
              return ctx.badRequest(`site must be one of: ${VALID_SITE_VALUES.join(', ')}`);
            }

            await strapi.db.query('admin::user').update({
              where: { id: userId },
              data: { preferedLanguage: site },
            });

            ctx.body = { success: true };
          } catch (err) {
            strapi.log.error(`[assign-site] EXCEPTION: ${(err as Error).message}`);
            ctx.internalServerError('Failed to assign site');
          }
        },
        config: {
          auth: false, // نتحقق يدويًا بالداخل عن طريق JWT (نفس أسلوب باقي الميدل وير)
        },
      },
    ]);
  },

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info('✅ Bootstrap file loaded successfully');

    strapi.db.lifecycles.subscribe({
      models: ['admin::user'],
      async afterCreate(event) {
        const { result } = event;

        await new Promise((resolve) => setTimeout(resolve, 1000));

        const freshUser = await strapi.db.query('admin::user').findOne({
          where: { id: result.id },
        });

        if (freshUser && freshUser.registrationToken) {
          const registrationUrl = `${process.env.PUBLIC_URL}/admin/auth/register?registrationToken=${freshUser.registrationToken}`;

          try {
            await strapi.plugin('email').service('email').send({
              to: freshUser.email,
              subject: "You've Been Invited to Naqsh Holding CMS",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #f9f9f9; border-radius: 12px;">
                  <h2 style="color: #1a1a1a;">Welcome to Naqsh</h2>
                  <p style="color: #333; font-size: 15px; line-height: 1.6;">
                    Hi ${freshUser.firstname || ''},
                  </p>
                  <p style="color: #333; font-size: 15px; line-height: 1.6;">
                    You've been invited to join the Naqsh workspace, where every detail comes together to manage and shape our content with precision.
                  </p>
                  <p style="color: #333; font-size: 15px; line-height: 1.6;">
                    Click the button below to set up your account and get started:
                  </p>
                  <p style="text-align: center; margin: 30px 0;">
                    <a href="${registrationUrl}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                      Accept Invitation
                    </a>
                  </p>
                  <p style="color: #888; font-size: 13px;">
                    If you weren't expecting this invitation, you can safely ignore this email.
                  </p>
                </div>
              `,
            });
            strapi.log.info(`✅ Invitation email sent to ${freshUser.email}`);
          } catch (err) {
            strapi.log.error(`❌ Failed to send invitation email to ${freshUser.email}:`, err);
          }
        } else {
          strapi.log.warn('⚠️ Still no registrationToken after delay for user id ' + result.id);
        }
      },
    });

    // ميدل وير 1: فلترة صفحات Page حسب موقع المستخدم
    strapi.server.use(async (ctx, next) => {
      const isPageRequest = ctx.request.path.startsWith(
        '/content-manager/collection-types/api::page.page'
      );

      if (isPageRequest) {
        try {
          const authHeader = ctx.request.header.authorization;
          const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

          if (token) {
            const secret = strapi.config.get('admin.auth.secret') as string;
            const payload = jwt.verify(token, secret) as any;

            const userId = payload?.id ?? payload?.userId ?? payload?.sub;

            if (userId) {
              const adminUser = await strapi.db.query('admin::user').findOne({
                where: { id: userId },
                populate: ['roles'],
              });

              const isSuperAdmin = adminUser?.roles?.some(
                (r: any) => r.code === 'strapi-super-admin'
              );

              if (adminUser && !isSuperAdmin && adminUser.preferedLanguage) {
                const site = await strapi.db.query('api::site.site').findOne({
                  where: { slag: adminUser.preferedLanguage },
                });

                if (site) {
                  ctx.query.filters = {
                    ...((ctx.query.filters as object) || {}),
                    site: site.id,
                  };
                }
              }
            }
          }
        } catch (err) {
          strapi.log.error(`[site-filter-koa] EXCEPTION: ${(err as Error).message}`);
        }
      }

      await next();
    });

    // ميدل وير 2: فلترة مكتبة الوسائط (Media Library) حسب فولدر شركة المستخدم
    strapi.server.use(async (ctx, next) => {
      const isUploadRequest =
        ctx.request.path.startsWith('/upload/files') ||
        ctx.request.path.startsWith('/upload/folders');

      if (isUploadRequest) {
        try {
          const authHeader = ctx.request.header.authorization;
          const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

          if (token) {
            const secret = strapi.config.get('admin.auth.secret') as string;
            const payload = jwt.verify(token, secret) as any;
            const userId = payload?.id ?? payload?.userId ?? payload?.sub;

            if (userId) {
              const adminUser = await strapi.db.query('admin::user').findOne({
                where: { id: userId },
                populate: ['roles'],
              });

              const isSuperAdmin = adminUser?.roles?.some(
                (r: any) => r.code === 'strapi-super-admin'
              );

              if (adminUser && !isSuperAdmin && adminUser.preferedLanguage) {
                const folderId = SITE_TO_MEDIA_FOLDER[adminUser.preferedLanguage];

                if (folderId) {
                  strapi.log.info(`[media-filter] user ${adminUser.email} → folder ${folderId}`);

                  if (ctx.request.path.startsWith('/upload/files')) {
                    ctx.query.folder = String(folderId);
                    ctx.query.filters = {
                      ...((ctx.query.filters as object) || {}),
                      folderPath: { $startsWith: `/${folderId}` },
                    };
                  }

                  if (ctx.request.path.startsWith('/upload/folders')) {
                    ctx.query.filters = {
                      ...((ctx.query.filters as object) || {}),
                      id: folderId,
                    };
                  }
                }
              }
            }
          }
        } catch (err) {
          strapi.log.error(`[media-filter] EXCEPTION: ${(err as Error).message}`);
        }
      }

      await next();
    });
  },
};
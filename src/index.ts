import type { Core } from '@strapi/strapi';
import jwt from 'jsonwebtoken';

// خريطة preferedLanguage → رقم فولدر مكتبة الوسائط لكل شركة
const SITE_TO_MEDIA_FOLDER: Record<string, number> = {
  burooj: 2,
  'burooj-air': 4,
  naqsh: 3,
  'efficiency-center': 5,
  '6-degrees': 1,
};

// نفس القيم المسموحة تُستخدم أيضًا عند تعيين شركة لموظف عبر الودجت
const VALID_SITE_VALUES = Object.keys(SITE_TO_MEDIA_FOLDER);

// username ممكن يحمل شركة وحدة أو كذا شركة مفصولة بفاصلة - نحولها لمصفوفة نظيفة
function parseUserSites(username?: string | null): string[] {
  if (!username) return [];
  return username
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

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

            const { userId, sites } = ctx.request.body as { userId?: number; sites?: string[] };

            if (!userId || !Array.isArray(sites) || sites.length === 0) {
              return ctx.badRequest('userId and a non-empty sites array are required');
            }

            const invalid = sites.filter((s) => !VALID_SITE_VALUES.includes(s));
            if (invalid.length > 0) {
              return ctx.badRequest(
                `Invalid site(s): ${invalid.join(', ')}. Must be one of: ${VALID_SITE_VALUES.join(', ')}`
              );
            }

            await strapi.db.query('admin::user').update({
              where: { id: userId },
              data: { username: sites.join(',') },
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

    // يمنع المتصفح من عمل كاش لصفحة index.html نفسها (يحل مشكلة الصفحة البيضاء بعد أي نشر جديد)
    strapi.server.use(async (ctx, next) => {
      await next();

      const path = ctx.request.path;
      const isAdminShell = path === '/admin' || path.endsWith('/admin/') || path.endsWith('index.html');

      if (isAdminShell) {
        ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        ctx.set('Pragma', 'no-cache');
        ctx.set('Expires', '0');
      }
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

              if (adminUser && !isSuperAdmin && adminUser.username) {
                const userSites = parseUserSites(adminUser.username);
                const sites = await strapi.db.query('api::site.site').findMany({
                  where: { slag: { $in: userSites } },
                });

                if (sites.length > 0) {
                  ctx.query.filters = {
                    ...((ctx.query.filters as object) || {}),
                    site: { $in: sites.map((s: any) => s.id) },
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

              if (adminUser && !isSuperAdmin && adminUser.username) {
                const userSites = parseUserSites(adminUser.username);
                const folderIds = userSites
                  .map((site) => SITE_TO_MEDIA_FOLDER[site])
                  .filter((id): id is number => !!id);

                if (folderIds.length > 0) {
                  strapi.log.info(`[media-filter] user ${adminUser.email} → folders ${folderIds.join(',')}`);

                  if (ctx.request.path.startsWith('/upload/files')) {
                    // لو فولدر وحد بس، نجبر التنقل التلقائي له (نفس السلوك القديم)
                    if (folderIds.length === 1) {
                      ctx.query.folder = String(folderIds[0]);
                    }
                    ctx.query.filters = {
                      ...((ctx.query.filters as object) || {}),
                      $or: folderIds.map((id) => ({ folderPath: { $startsWith: `/${id}` } })),
                    };
                  }

                  if (ctx.request.path.startsWith('/upload/folders')) {
                    ctx.query.filters = {
                      ...((ctx.query.filters as object) || {}),
                      id: { $in: folderIds },
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
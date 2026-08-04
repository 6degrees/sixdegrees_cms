import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

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
              subject: "You've Been Invited to Naqsh",
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

    // فلترة صفحات Page حسب الموقع المرتبط بالمستخدم (اعتراض مباشر على مستوى Koa)
    strapi.server.use(async (ctx, next) => {
      const isPageRequest = ctx.request.path.startsWith(
        '/content-manager/collection-types/api::page.page'
      );

      if (isPageRequest) {
        strapi.log.info(`[site-filter-koa] path: ${ctx.request.path}`);
        strapi.log.info(`[site-filter-koa] user: ${ctx.state.user?.email || 'no user'}`);

        const adminUser = ctx.state.user;
        const isSuperAdmin = adminUser?.roles?.some(
          (r: any) => r.code === 'strapi-super-admin'
        );

        if (adminUser && !isSuperAdmin && adminUser.preferedLanguage) {
          strapi.log.info(`[site-filter-koa] preferedLanguage: ${adminUser.preferedLanguage}`);

          const site = await strapi.db.query('api::site.site').findOne({
            where: { slag: adminUser.preferedLanguage },
          });

          strapi.log.info(`[site-filter-koa] matched site: ${site?.id}`);

          if (site) {
            ctx.query.filters = {
              ...((ctx.query.filters as object) || {}),
              site: site.id,
            };
            strapi.log.info(`[site-filter-koa] injected filter, new query: ${JSON.stringify(ctx.query)}`);
          }
        }
      }

      await next();
    });
  },
};
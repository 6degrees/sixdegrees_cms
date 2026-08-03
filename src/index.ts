import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    strapi.log.info('✅ Bootstrap file loaded successfully');

    strapi.db.lifecycles.subscribe({
      models: ['admin::user'],
      async afterCreate(event) {
        const { result } = event;

        // ننتظر شوي عشان نعطي وقت لأي معالجة داخلية غير متزامنة
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const freshUser = await strapi.db.query('admin::user').findOne({
          where: { id: result.id },
        });

        if (freshUser && freshUser.registrationToken) {
          const registrationUrl = `${process.env.PUBLIC_URL}/admin/auth/register?registrationToken=${freshUser.registrationToken}`;

          try {
            await strapi.plugin('email').service('email').send({
              to: freshUser.email,
              subject: 'تمت دعوتك للانضمام إلى لوحة تحكم 6Degrees',
              html: `
                <p>مرحبًا ${freshUser.firstname || ''}،</p>
                <p>تمت دعوتك للانضمام إلى لوحة تحكم سترابي الخاصة بـ 6Degrees.</p>
                <p>اضغطي على الرابط التالي لإكمال التسجيل:</p>
                <p><a href="${registrationUrl}">${registrationUrl}</a></p>
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
  },
};
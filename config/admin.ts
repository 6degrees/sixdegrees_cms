import type { Core } from '@strapi/strapi';

// خريطة slag الموقع (Site.slag) → رابط الفرونت إند الفعلي لكل شركة
const SITE_PREVIEW_BASE: Record<string, string> = {
  '6-degrees': 'https://6degrees.com.sa',
  burooj: 'https://burooj.pro',
  'burooj-air': 'https://buroojair.com',
  naqsh: 'https://naqsh.com.sa',
  'efficiency-center': 'https://efficiencys.com.sa',
};

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET')!,
  },
  apiToken: {
    salt: env('API_TOKEN_SALT')!,
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT')!,
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY')!,
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: [
        'https://6degrees.com.sa',
        'https://burooj.pro',
        'https://naqsh.com.sa',
        'https://efficiencys.com.sa',
      ],
      async handler(uid: string, { documentId, locale, status }: any) {
        // بس صفحات (Page) عندها معاينة - أي نوع محتوى ثاني نرجع فاضي
        if (uid !== 'api::page.page') {
          return null;
        }

        const document = await strapi.documents(uid as any).findOne({
          documentId,
          populate: { site: true },
        } as any);

        const site = (document as any)?.site;
        const siteSlag = site?.slag as string | undefined;
        const base = siteSlag ? SITE_PREVIEW_BASE[siteSlag] : undefined;

        if (!base) {
          // شركة غير معروفة - ما نقدر نبني رابط معاينة صحيح
          return null;
        }

        // 6Degrees فقط يحتاج بادئة اللغة (/en) بالرابط الأساسي
        const localeSegment = siteSlag === '6-degrees' ? `/${locale || 'en'}` : '';

        const params = new URLSearchParams({
          documentId,
          status: status || 'draft',
        });

        return `${base}${localeSegment}/preview?${params.toString()}`;
      },
    },
  },
});

export default config;
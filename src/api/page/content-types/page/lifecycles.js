async function applySiteFilter(event) {
  const ctx = strapi.requestContext.get();
  if (!ctx) return; // مو request من الأدمن (مثلاً سكربت أو seed)

  const adminUser = ctx.state && ctx.state.user;
  if (!adminUser || !adminUser.id) return; // مو أدمن مسجل دخول

  // ✅ استثني السوبر أدمن (عدّلي الشرط حسب اسم الرول عندك)
  const isSuperAdmin = (adminUser.roles || []).some(
    (r) => r.code === 'strapi-super-admin'
  );
  if (isSuperAdmin) return;

  if (!adminUser.preferedLanguage) return;

  const site = await strapi.db.query('api::site.site').findOne({
    where: { slag: adminUser.preferedLanguage },
  });
  if (!site) return;

  event.params.where = {
    $and: [event.params.where || {}, { site: site.id }],
  };
}

module.exports = {
  async beforeFindMany(event) {
    await applySiteFilter(event);
  },
  async beforeFindOne(event) {
    await applySiteFilter(event);
  },
  async beforeCount(event) {
    await applySiteFilter(event);
  },
};
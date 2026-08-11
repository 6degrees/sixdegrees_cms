import type { StrapiApp } from '@strapi/strapi/admin';
import { useFetchClient } from '@strapi/strapi/admin';
import { darkTheme } from '@strapi/design-system';
import { useEffect, useState } from 'react';
import Logo from './extensions/naqsh.png';
import HeroBackground from './extensions/hero-background.png';
import FaviconImage from './extensions/naqsh-favicon.png';
import SixDegreesLogo from './extensions/logo.png';

const customStyles = `
body.naqsh-auth-page {
  background-color: #000000 !important;
  margin: 0 !important;
  min-height: 100vh !important;
}

body.naqsh-auth-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 50%;
  background-image: var(--hero-bg);
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  z-index: 0;
}

body.naqsh-auth-page .naqsh-auth-box {
  position: fixed !important;
  top: 50% !important;
  right: 8% !important;
  transform: translateY(-50%) !important;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%) !important;
  border-radius: 20px !important;
  overflow-y: auto !important;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.7) !important;
  margin: 0 !important;
  padding: 48px 56px !important;
  max-width: 560px !important;
  width: 90% !important;
  max-height: 85vh !important;
  z-index: 10 !important;
}

body.naqsh-auth-page h1,
body.naqsh-auth-page p,
body.naqsh-auth-page label {
  color: #ffffff !important;
}

body.naqsh-auth-page .naqsh-auth-box *:not(a):not(label *) {
  color: #ffffff !important;
}

body.naqsh-auth-page .naqsh-auth-box-wrapper {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  min-height: 0 !important;
}

body.naqsh-auth-page input {
  background-color: #2d2d2d !important;
  border-color: #444 !important;
  color: #ffffff !important;
}

body.naqsh-auth-page a {
  color: #a5a5ff !important;
}



body.naqsh-auth-page header {
  display: none !important;
}
`;

function injectCustomStyles() {
  if (document.getElementById('naqsh-custom-styles')) return;
  const styleTag = document.createElement('style');
  styleTag.id = 'naqsh-custom-styles';
  styleTag.textContent = customStyles;
  document.head.appendChild(styleTag);
}

function setFavicon(url: string) {
  let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

function toggleAuthPageClass() {
  const isAuthPage = window.location.pathname.includes('/auth/');
  document.body.classList.toggle('naqsh-auth-page', isAuthPage);
  if (isAuthPage) {
    injectPoweredByBadge();
  } else {
    removePoweredByBadge();
  }
}

function watchAndFixTitle() {
  const titleObserver = new MutationObserver(() => {
    if (document.title.includes('Strapi')) {
      document.title = document.title.replace('Strapi', 'Naqsh');
    }
  });
  const titleElement = document.querySelector('title');
  if (titleElement) {
    titleObserver.observe(titleElement, { childList: true });
  }
}

// يجبر Strapi يقرأ "النظام Dark دائمًا" بغض النظر عن إعداد جهاز اليوزر الفعلي
function forceDarkColorScheme() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  if ((window as any).__naqshMatchMediaPatched) return;
  (window as any).__naqshMatchMediaPatched = true;

  const originalMatchMedia = window.matchMedia.bind(window);

  window.matchMedia = ((query: string) => {
    const mql = originalMatchMedia(query);

    if (query.includes('prefers-color-scheme: dark')) {
      Object.defineProperty(mql, 'matches', { get: () => true, configurable: true });
    } else if (query.includes('prefers-color-scheme: light')) {
      Object.defineProperty(mql, 'matches', { get: () => false, configurable: true });
    }

    return mql;
  }) as typeof window.matchMedia;
}

function forceDarkTheme() {
  try {
    const stored = localStorage.getItem('STRAPI_THEME');
    if (stored !== '"dark"') {
      localStorage.setItem('STRAPI_THEME', '"dark"');
    }
  } catch (e) {
    // localStorage غير متاح
  }
}

// يفرض dark theme بشكل متكرر لثواني بعد أي تنقل (يغطي لحظة تسجيل الدخول)
function persistentForceDarkTheme() {
  forceDarkTheme();
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    const stored = localStorage.getItem('STRAPI_THEME');
    if (stored !== '"dark"') {
      localStorage.setItem('STRAPI_THEME', '"dark"');
      // نعيد تحميل الصفحة فقط لو تغيرت القيمة فعليًا بعد ما كانت dark
      window.location.reload();
    }
    if (attempts > 10) clearInterval(interval); // يوقف بعد 10 محاولات (~5 ثواني)
  }, 500);
}

function hideSubtitleText() {
  const textsToHide = [
    'Log in to your Strapi account',
    'Credentials are only used to authenticate in Strapi. All saved data will be stored in your database.',
  ];
  const elements = document.querySelectorAll('body span, body p');
  elements.forEach((el) => {
    const text = el.textContent?.trim();
    if (text && textsToHide.includes(text)) {
      (el as HTMLElement).style.display = 'none';
    }
  });
}

// يحدد عنصر "الكرت" الفعلي في صفحة auth بغض النظر عن وجود form أو لا
function findAuthBox(): HTMLElement | null {
  // الحالة العادية: صفحات فيها form (login/register)
  const formBox = document.querySelector('div:has(> form)') as HTMLElement | null;
  if (formBox) return formBox;

  // صفحات بدون form (forgot-password-success مثلاً): نصعد من العنوان h1
  // لأقرب div فيه أكثر من عنصر فرعي واحد (يعني فيه محتوى فعلي، مو غلاف فاضي)
  const h1 = document.querySelector('h1');
  let el = h1?.parentElement as HTMLElement | null;
  while (el && el.tagName === 'DIV' && el.children.length < 2) {
    el = el.parentElement as HTMLElement | null;
  }
  return el && el.tagName === 'DIV' ? el : null;
}

function styleAuthBox() {
  document.querySelectorAll('.naqsh-auth-box').forEach((el) => el.classList.remove('naqsh-auth-box'));
  document.querySelectorAll('.naqsh-auth-box-wrapper').forEach((el) => el.classList.remove('naqsh-auth-box-wrapper'));

  const box = findAuthBox();
  if (box) {
    box.classList.add('naqsh-auth-box');
    // الأب المباشر قد يكون صندوق سترابي الافتراضي (خلفية بيضاء فاضية) - نخفي شكله فقط
    const parent = box.parentElement;
    if (parent && parent.tagName === 'DIV') {
      parent.classList.add('naqsh-auth-box-wrapper');
    }
  }
}

function positionAuthPageLinks() {
  styleAuthBox();
  const links = document.querySelectorAll('a');
  const box = document.querySelector('.naqsh-auth-box') as HTMLElement | null;
  const targetTexts = ['Forgot your password?', 'Ready to sign in?', 'Sign in'];

  links.forEach((link) => {
    const text = link.textContent?.trim() || '';
    const linkEl = link as HTMLElement;

    if (targetTexts.includes(text)) {
      linkEl.style.position = 'fixed';
      linkEl.style.zIndex = '10';

      if (box) {
        const rect = box.getBoundingClientRect();
        linkEl.style.top = `${rect.bottom - 40}px`;
        linkEl.style.left = `${rect.left + 40}px`;
        linkEl.style.width = `${rect.width - 80}px`;
        linkEl.style.textAlign = 'center';
        linkEl.style.bottom = 'auto';
        linkEl.style.right = 'auto';
      }
      linkEl.dataset.naqshPositioned = 'true';
    } else if (linkEl.dataset.naqshPositioned === 'true') {
      // كان عليه تموضع ثابت سابقًا (من صفحة/حالة قديمة) - نرجعه لوضعه الطبيعي
      linkEl.style.position = '';
      linkEl.style.top = '';
      linkEl.style.left = '';
      linkEl.style.width = '';
      linkEl.style.textAlign = '';
      linkEl.style.bottom = '';
      linkEl.style.right = '';
      linkEl.style.zIndex = '';
      delete linkEl.dataset.naqshPositioned;
    }
  });
}

function injectPoweredByBadge() {
  if (document.getElementById('naqsh-powered-by')) return;
  const badge = document.createElement('div');
  badge.id = 'naqsh-powered-by';
  badge.style.position = 'fixed';
  badge.style.bottom = '26px';
  badge.style.left = '20px';
  badge.style.display = 'flex';
  badge.style.flexDirection = 'row';
  badge.style.alignItems = 'center';
  badge.style.gap = '4px';
  badge.style.zIndex = '20';
  badge.style.fontSize = '18px';
  badge.style.color = 'rgba(255,255,255,0.6)';
  badge.innerHTML = `
    <span>Operated by</span>
    <img src="${SixDegreesLogo}" style="height: 40px; width: auto; display: block;" alt="6Degrees" />
  `;
  document.body.appendChild(badge);
}




function removePoweredByBadge() {
  const badge = document.getElementById('naqsh-powered-by');
  if (badge) badge.remove();
}

function forcePageListColumns() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('STRAPI_LIST_VIEW_DISPLAYED_HEADERS:api::page.page')) {
        const desiredColumns = JSON.stringify(['site']);
        if (localStorage.getItem(key) !== desiredColumns) {
          localStorage.setItem(key, desiredColumns);
        }
      }
    });
  } catch (e) {
    // localStorage غير متاح
  }
}

type RecentPageEntry = {
  id: number;
  documentId: string;
  title?: string;
  publishedAt?: string;
  updatedBy?: { firstname?: string; lastname?: string } | null;
};

function PublishedByWidget() {
  const { get } = useFetchClient();
  const [entries, setEntries] = useState<RecentPageEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    get('/content-manager/collection-types/api::page.page?sort=publishedAt:desc&pageSize=5&status=published')
      .then((res: any) => {
        const results = res?.data?.results || res?.data?.data || [];
        setEntries(results);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') {
    return <div style={{ padding: '16px', opacity: 0.7 }}>Loading...</div>;
  }
  if (status === 'error' || entries.length === 0) {
    return <div style={{ padding: '16px', opacity: 0.7 }}>No data to display</div>;
  }

  return (
    <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {entries.map((entry) => {
        const name = entry.updatedBy
          ? `${entry.updatedBy.firstname || ''} ${entry.updatedBy.lastname || ''}`.trim()
          : '';
        return (
          <div
            key={entry.documentId || entry.id}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px' }}
          >
            <span>{entry.title || entry.documentId}</span>
            <span style={{ opacity: 0.8, fontSize: '15px' }}>{name || 'Unknown'}</span>
          </div>
        );
      })}
    </div>
  );
}

function PublishedByWidgetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AssignSiteWidget() {
  const { get, post } = useFetchClient();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'done' | 'error' | 'unauthorized'>('loading');
  const [message, setMessage] = useState('');

  const SITE_OPTIONS = [
    { value: 'burooj', label: 'Burooj' },
    { value: 'burooj-air', label: 'Burooj Air' },
    { value: 'naqsh', label: 'Naqsh' },
    { value: 'efficiency-center', label: 'Efficiency Center' },
    { value: '6-degrees', label: '6Degrees' },
  ];

  useEffect(() => {
    get('/admin/users/me')
      .then((res: any) => {
        const me = res?.data?.data || res?.data;
        const isSuperAdmin = me?.roles?.some((r: any) => r.code === 'strapi-super-admin');

        if (!isSuperAdmin) {
          setStatus('unauthorized');
          return;
        }

        return get('/admin/users').then((usersRes: any) => {
          const results = usersRes?.data?.data?.results || usersRes?.data?.results || [];
          setUsers(results);
          setStatus('idle');
        });
      })
      .catch(() => setStatus('error'));
  }, []);

  const handleAssign = async () => {
    if (!selectedUser || !selectedSite) return;
    setStatus('saving');
    setMessage('');
    try {
      await post('/naqsh/assign-site', { userId: Number(selectedUser), site: selectedSite });
      setStatus('done');
      setMessage('Assigned successfully.');
    } catch (err) {
      setStatus('error');
      setMessage('Failed to assign. Check console/logs.');
    }
  };

  if (status === 'unauthorized') {
    return null;
  }

  if (status === 'loading') {
    return <div style={{ padding: '16px', opacity: 0.7 }}>Loading...</div>;
  }

  const selectStyle: React.CSSProperties = {
    padding: '12px 14px',
    borderRadius: '8px',
    background: '#2d2d2d',
    color: '#ffffff',
    border: '1px solid #444',
    fontSize: '14px',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px' }}>
      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        style={selectStyle}
      >
        <option value="">Select employee...</option>
        {users.map((u: any) => (
          <option key={u.id} value={u.id}>
            {u.firstname} {u.lastname} ({u.email})
          </option>
        ))}
      </select>

      <select
        value={selectedSite}
        onChange={(e) => setSelectedSite(e.target.value)}
        style={selectStyle}
      >
        <option value="">Select company...</option>
        {SITE_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <button
        onClick={handleAssign}
        disabled={!selectedUser || !selectedSite || status === 'saving'}
        style={{
          padding: '12px',
          borderRadius: '8px',
          cursor: !selectedUser || !selectedSite || status === 'saving' ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          border: 'none',
          background: !selectedUser || !selectedSite || status === 'saving' ? '#3a3a3a' : '#2d2d2d',
          color: !selectedUser || !selectedSite || status === 'saving' ? '#888' : '#ffffff',
        }}
      >
        {status === 'saving' ? 'Assigning...' : 'Assign Company'}
      </button>

      {message && (
        <div style={{ opacity: 0.85, fontSize: '13px', color: status === 'error' ? '#ff8a8a' : '#8affa0' }}>
          {message}
        </div>
      )}
    </div>
  );
}

function AssignSiteWidgetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  );
}

// خريطة username (شركة المستخدم) → الأسماء المحتملة لفئتها بنافذة "Pick one component"
const SITE_CATEGORY_LABELS: Record<string, string[]> = {
  burooj: ['burooj'],
  'burooj-air': ['air', 'burooj air', 'burooj-air'],
  naqsh: ['naqsh'],
  'efficiency-center': ['ec', 'efficiency', 'efficiency center'],
  '6-degrees': ['sections'],
};

// كل الأسماء الممكنة لكل الفئات (نستخدمها لتحديد أي عنصر نص هو "اسم فئة" أصلاً)
const ALL_CATEGORY_LABELS = new Set(
  Object.values(SITE_CATEGORY_LABELS).flat()
);

let cachedUserSiteInfo: { isSuperAdmin: boolean; allowedLabels: string[] } | null = null;
let fetchingUserSiteInfo = false;

function getAuthToken(): string | null {
  const fromStorage = localStorage.getItem('jwtToken');
  if (fromStorage) return fromStorage.replace(/^"|"$/g, '');
  const match = document.cookie.match(/(?:^|;\s*)jwtToken=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  return null;
}

async function loadUserSiteInfo() {
  if (cachedUserSiteInfo || fetchingUserSiteInfo) return;
  fetchingUserSiteInfo = true;
  try {
    const token = getAuthToken();
    const res = await fetch('/admin/users/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: 'include',
    });
    if (!res.ok) return;
    const json = await res.json();
    const me = json?.data || json;
    const isSuperAdmin = !!me?.roles?.some((r: any) => r.code === 'strapi-super-admin');
    const username = me?.username as string | undefined;
    const allowedLabels = username && SITE_CATEGORY_LABELS[username] ? SITE_CATEGORY_LABELS[username] : [];
    cachedUserSiteInfo = { isSuperAdmin, allowedLabels };
  } catch (e) {
    // تجاهل - لو فشل، ما نخفي شي (أفضل نعرض الكل بدل ما نخفي غلط)
  } finally {
    fetchingUserSiteInfo = false;
  }
}

function filterComponentCategories() {
  if (!cachedUserSiteInfo || cachedUserSiteInfo.isSuperAdmin) return; // سوبر أدمن يشوف الكل
  const { allowedLabels } = cachedUserSiteInfo;
  if (allowedLabels.length === 0) return; // ما عرفنا شركته - ما نخفي شي احتياطًا

  const allElements = document.querySelectorAll('button, div, span');
  allElements.forEach((el) => {
    const text = el.textContent?.trim().toLowerCase() || '';
    if (!text || el.children.length > 0) return; // نبي عنصر نص طرفي بس (مو حاوي عناصر ثانية)
    if (!ALL_CATEGORY_LABELS.has(text)) return;

    const isAllowed = allowedLabels.includes(text);
    if (isAllowed) return;

    // نطلع لأقرب صف قابل للنقر (button) نخفيه، أو لين 4 مستويات كحد أقصى
    let row: HTMLElement | null = el as HTMLElement;
    for (let i = 0; i < 4 && row; i++) {
      if (row.tagName === 'BUTTON' || row.getAttribute('role') === 'button') break;
      row = row.parentElement;
    }
    if (row) {
      row.style.display = 'none';
    }
  });
}

if (typeof document !== 'undefined') {
  forceDarkColorScheme();
  injectCustomStyles();
  document.documentElement.style.setProperty('--hero-bg', `url(${HeroBackground})`);
  document.title = 'Naqsh CMS';
  setFavicon(FaviconImage);
  toggleAuthPageClass();
  forceDarkTheme();
  watchAndFixTitle();
  hideSubtitleText();
  positionAuthPageLinks();
  forcePageListColumns();
  loadUserSiteInfo();
  setTimeout(positionAuthPageLinks, 300);
  setTimeout(positionAuthPageLinks, 800);
  window.addEventListener('resize', positionAuthPageLinks);

  const observer = new MutationObserver(() => {
    toggleAuthPageClass();
    hideSubtitleText();
    positionAuthPageLinks();
    forcePageListColumns();
    filterComponentCategories();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('popstate', toggleAuthPageClass);
}

export default {
  config: {
    auth: {
      logo: Logo,
    },
    menu: {
      logo: Logo,
    },
    head: {
      favicon: FaviconImage,
    },
    theme: {
      light: darkTheme,
      dark: darkTheme,
    },
    translations: {
      en: {
        'Auth.form.welcome.title': 'Naqsh Portal',
        'Auth.form.welcome.subtitle': 'Centralized management for all subsidiary sites',
        'app.components.LeftMenu.navbrand.title': 'Naqsh CMS',
        'Auth.form.email.placeholder': 'e.g. name@naqsh.com',
        'content-manager.containers.List.draft': 'Pending Review',
        'content-manager.containers.List.modified': 'Pending Review (Updated)',
        'content-manager.containers.edit.tabs.draft': 'pending review',
        'content-manager.relation.publicationState.draft': 'Pending Review',
        'content-manager.components.Select.draft-info-title': 'Pending Review',
      },
    },
  },
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'naqsh-customizations',
      name: 'Naqsh Customizations',
    });

    app.widgets.register({
      icon: PublishedByWidgetIcon,
      title: {
        id: 'naqsh-customizations.widget.published-by.title',
        defaultMessage: 'Last Published + Publisher',
      },
      component: async () => PublishedByWidget,
      id: 'naqsh-published-by',
      pluginId: 'naqsh-customizations',
    });

    app.widgets.register({
      icon: AssignSiteWidgetIcon,
      title: {
        id: 'naqsh-customizations.widget.assign-site.title',
        defaultMessage: 'Assign Employee Company',
      },
      component: async () => AssignSiteWidget,
      id: 'naqsh-assign-site',
      pluginId: 'naqsh-customizations',
    });
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
    forceDarkColorScheme();
    injectCustomStyles();
    document.title = 'Naqsh CMS';
    setFavicon(FaviconImage);
    toggleAuthPageClass();
    forceDarkTheme();
    hideSubtitleText();
    positionAuthPageLinks();
    forcePageListColumns();
  },
};
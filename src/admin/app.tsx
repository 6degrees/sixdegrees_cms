import type { StrapiApp } from '@strapi/strapi/admin';
import { useFetchClient } from '@strapi/strapi/admin';
import { darkTheme } from '@strapi/design-system';
import { useEffect, useState } from 'react';
import Logo from './extensions/naqsh.png';
import HeroBackground from './extensions/hero-background.png';
import FaviconImage from './extensions/naqsh-favicon.png';
import SixDegreesLogo from './extensions/6-Degrees2.png';

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
  badge.style.bottom = '20px';
  badge.style.left = '20px';
  badge.style.display = 'flex';
  badge.style.flexDirection = 'row';
  badge.style.alignItems = 'center';
  badge.style.gap = '4px';
  badge.style.zIndex = '20';
  badge.style.fontSize = '16px';
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
  setTimeout(positionAuthPageLinks, 300);
  setTimeout(positionAuthPageLinks, 800);
  window.addEventListener('resize', positionAuthPageLinks);

  const observer = new MutationObserver(() => {
    toggleAuthPageClass();
    hideSubtitleText();
    positionAuthPageLinks();
    forcePageListColumns();
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
        'Auth.form.welcome.title': 'Naqsh Holding CMS',
        'Auth.form.welcome.subtitle': 'Centralized management for all subsidiary sites',
        'app.components.LeftMenu.navbrand.title': 'Naqsh CMS',
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
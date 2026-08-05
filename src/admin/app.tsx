import type { StrapiApp } from '@strapi/strapi/admin';
import Logo from './extensions/naqsh-logo.png';
import HeroBackground from './extensions/hero-background.png';
import FaviconImage from './extensions/naqsh-favicon.png';

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

body.naqsh-auth-page div:has(> form) {
  position: fixed !important;
  top: 50% !important;
  right: 8% !important;
  transform: translateY(-50%) !important;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%) !important;
  border-radius: 20px !important;
  overflow-y: auto !important;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.7) !important;
  margin: 0 !important;
  max-width: 500px !important;
  width: 90% !important;
  max-height: 85vh !important;
  z-index: 10 !important;
}

body.naqsh-auth-page h1,
body.naqsh-auth-page p,
body.naqsh-auth-page label {
  color: #ffffff !important;
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
      window.location.reload();
    }
  } catch (e) {
    // localStorage غير متاح
  }
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

function positionForgotPasswordLink() {
  const links = document.querySelectorAll('a');
  const box = document.querySelector('div:has(> form)') as HTMLElement | null;

  links.forEach((link) => {
    if (link.textContent?.trim() === 'Forgot your password?') {
      const linkEl = link as HTMLElement;
      linkEl.style.position = 'fixed';
      linkEl.style.zIndex = '10';

      if (box) {
        const rect = box.getBoundingClientRect();
        linkEl.style.top = `${rect.bottom + 20}px`;
        linkEl.style.left = `${rect.left}px`;
        linkEl.style.width = `${rect.width}px`;
        linkEl.style.textAlign = 'center';
        linkEl.style.bottom = 'auto';
        linkEl.style.right = 'auto';
      }
    }
  });
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
  positionForgotPasswordLink();
  forcePageListColumns();
  setTimeout(positionForgotPasswordLink, 300);
  setTimeout(positionForgotPasswordLink, 800);
  window.addEventListener('resize', positionForgotPasswordLink);

  const observer = new MutationObserver(() => {
    toggleAuthPageClass();
    hideSubtitleText();
    positionForgotPasswordLink();
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
    translations: {
      en: {
        'Auth.form.welcome.title': 'Welcome to Naqsh',
        'Auth.form.welcome.subtitle': '',
        'app.components.LeftMenu.navbrand.title': 'Naqsh CMS',
      },
    },
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
    positionForgotPasswordLink();
    forcePageListColumns();
  },
};
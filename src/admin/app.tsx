import './extensions/custom.css';
import type { StrapiApp } from '@strapi/strapi/admin';
import Logo from './extensions/naqsh-logo.png';
import HeroBackground from './extensions/hero-background.png';
import FaviconImage from './extensions/naqsh-favicon.png';

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

if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--hero-bg', `url(${HeroBackground})`);
  document.title = 'Naqsh CMS';
  setFavicon(FaviconImage);
  toggleAuthPageClass();
  forceDarkTheme();
  watchAndFixTitle();

  const observer = new MutationObserver(() => {
    toggleAuthPageClass();
  });
  observer.observe(document.body, { childList: true, subtree: false });

  window.addEventListener('popstate', toggleAuthPageClass);
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

if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--hero-bg', `url(${HeroBackground})`);
  document.title = 'Naqsh CMS';
  setFavicon(FaviconImage);
  toggleAuthPageClass();
  forceDarkTheme();

  const observer = new MutationObserver(() => {
    toggleAuthPageClass();
  });
  observer.observe(document.body, { childList: true, subtree: false });

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
    document.title = 'Naqsh CMS';
    setFavicon(FaviconImage);
    toggleAuthPageClass();
    forceDarkTheme();
  },
};
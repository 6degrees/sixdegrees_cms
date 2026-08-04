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

body.naqsh-auth-page main {
  position: relative !important;
  z-index: 1 !important;
  min-height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-end !important;
  justify-content: center !important;
  padding-right: 8% !important;
}

body.naqsh-auth-page main a {
  align-self: center !important;
  margin-top: 20px !important;
}

body.naqsh-auth-page main > div:first-child {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%) !important;
  border-radius: 20px !important;
  overflow: hidden !important;
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.7) !important;
  margin: 0 !important;
  max-width: 500px !important;
  width: 100% !important;
}

body.naqsh-auth-page main h1,
body.naqsh-auth-page main p,
body.naqsh-auth-page main label {
  color: #ffffff !important;
}

body.naqsh-auth-page main input {
  background-color: #2d2d2d !important;
  border-color: #444 !important;
  color: #ffffff !important;
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
  const spans = document.querySelectorAll('main span');
  spans.forEach((span) => {
    if (span.textContent?.trim() === 'Log in to your Strapi account') {
      (span as HTMLElement).style.display = 'none';
    }
  });
}

if (typeof document !== 'undefined') {
  injectCustomStyles();
  document.documentElement.style.setProperty('--hero-bg', `url(${HeroBackground})`);
  document.title = 'Naqsh CMS';
  setFavicon(FaviconImage);
  toggleAuthPageClass();
  forceDarkTheme();
  watchAndFixTitle();
  hideSubtitleText();

  const observer = new MutationObserver(() => {
    toggleAuthPageClass();
    hideSubtitleText();
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
    injectCustomStyles();
    document.title = 'Naqsh CMS';
    setFavicon(FaviconImage);
    toggleAuthPageClass();
    forceDarkTheme();
    hideSubtitleText();
  },
};
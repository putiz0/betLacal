(function () {
  const SUPPORTED_LOCALES = ["pt-BR", "en", "es"];
  const FALLBACK_LOCALE = "pt-BR";

  let currentLocale = FALLBACK_LOCALE;
  let translations = {};
  let loaded = false;

  function detectLocale() {
    const stored = localStorage.getItem("betlocal.locale");
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
    const nav = navigator.language || "";
    for (const loc of SUPPORTED_LOCALES) {
      if (nav.startsWith(loc)) return loc;
    }
    return FALLBACK_LOCALE;
  }

  async function loadLocale(locale) {
    try {
      const response = await fetch(`locales/${locale}.json`);
      if (!response.ok) throw new Error("Not found");
      return await response.json();
    } catch {
      if (locale !== FALLBACK_LOCALE) {
        const fallback = await fetch(`locales/${FALLBACK_LOCALE}.json`);
        return await fallback.json();
      }
      return {};
    }
  }

  window.__ = function (key, params) {
    if (!loaded) return key;
    let value = translations[key];
    if (value === undefined) value = key;
    if (params) {
      value = value.replace(/\{(\w+)\}/g, (_, k) => params[k] !== undefined ? params[k] : `{${k}}`);
    }
    return value;
  };

  window.BetLocalI18n = {
    getLocale() { return currentLocale; },

    async setLocale(locale) {
      if (!SUPPORTED_LOCALES.includes(locale)) return;
      currentLocale = locale;
      translations = await loadLocale(locale);
      loaded = true;
      localStorage.setItem("betlocal.locale", locale);
      document.documentElement.lang = locale;
      document.dispatchEvent(new CustomEvent("betlocal:locale-changed", { detail: { locale } }));
    },

    async init() {
      const locale = detectLocale();
      await this.setLocale(locale);
    }
  };
})();

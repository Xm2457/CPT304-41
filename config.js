// config.js
// Centralized configuration management

const CONFIG = {
  STORAGE_KEY: "entry_list",
  LANGUAGE_KEY: "budget_app_language",
  COOKIE_CONSENT_KEY: "cookieConsent",
  CURRENCY_SIGN: "$",
  COLORS: {
    income: "#FFFFFF",
    expense: "#F0624D"
  },
  CHART: {
    WIDTH: 50,
    HEIGHT: 50,
    RADIUS: 20,
    LINE_WIDTH: 8
  }
};

/* istanbul ignore next */
if (typeof globalThis !== "undefined") {
  globalThis.CONFIG = CONFIG;
}

/* istanbul ignore next */
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
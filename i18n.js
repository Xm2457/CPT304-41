// i18n.js
// Internationalization: externalized text + language switch
// Supports browser usage and Jest/CommonJS tests.

(function (root) {
  const TRANSLATIONS = {
    en: {
      "app.title.prefix": "Budget",
      "app.title.suffix": "App",
      "language.en": "EN",
      "language.zh": "中文",

      "summary.balance": "Balance",
      "summary.income": "Income",
      "summary.outcome": "Outcome",

      "dashboard.title": "Dashboard",
      "tabs.expenses": "Expenses",
      "tabs.income": "Income",
      "tabs.all": "All",

      "input.titlePlaceholder": "title",
      "input.amountPlaceholder": "$0",
      "button.addExpense": "Add Expense",
      "button.addIncome": "Add Income",

      "entry.edit": "Edit entry",
      "entry.delete": "Delete entry",

      "cookie.message.start": "We use local storage to save your budget data and preferences. By clicking",
      "cookie.message.accept": "Accept All",
      "cookie.message.end": "you consent to our use of essential storage. Read our",
      "cookie.privacy": "Privacy Policy",
      "cookie.reject": "Reject",
      "cookie.accept": "Accept All",

      "error.titleLength": "Title must be between 2 and 50 characters.",
      "error.invalidTitle": "Invalid characters detected in title.",
      "error.amountRange": "Please enter a valid amount between 0 and 1,000,000.",
      "error.storageSave": "Entry added but could not be saved due to browser storage limitations."
    },

    zh: {
      "app.title.prefix": "预算",
      "app.title.suffix": "应用",
      "language.en": "EN",
      "language.zh": "中文",

      "summary.balance": "余额",
      "summary.income": "收入",
      "summary.outcome": "支出",

      "dashboard.title": "仪表盘",
      "tabs.expenses": "支出",
      "tabs.income": "收入",
      "tabs.all": "全部",

      "input.titlePlaceholder": "标题",
      "input.amountPlaceholder": "$0",
      "button.addExpense": "添加支出",
      "button.addIncome": "添加收入",

      "entry.edit": "编辑记录",
      "entry.delete": "删除记录",

      "cookie.message.start": "我们使用本地存储来保存你的预算数据和偏好设置。点击",
      "cookie.message.accept": "全部接受",
      "cookie.message.end": "即表示你同意我们使用必要存储。阅读我们的",
      "cookie.privacy": "隐私政策",
      "cookie.reject": "拒绝",
      "cookie.accept": "全部接受",

      "error.titleLength": "标题长度必须在 2 到 50 个字符之间。",
      "error.invalidTitle": "标题中检测到非法字符。",
      "error.amountRange": "请输入 0 到 1,000,000 之间的有效金额。",
      "error.storageSave": "记录已添加，但由于浏览器存储限制，无法保存。"
    }
  };

  function getConfig() {
    return root.CONFIG || {
      LANGUAGE_KEY: "budget_app_language"
    };
  }

  function getStorage() {
    try {
      return root.localStorage;
    /* istanbul ignore next */
    } catch (error) {
      console.warn("localStorage is not available:", error);
      return null;
    }
  }

  function getDocument() {
    return root.document;
  }

  function getInitialLanguage() {
    const config = getConfig();
    const storage = getStorage();

    try {
      const savedLanguage = storage
        ? storage.getItem(config.LANGUAGE_KEY)
        : null;

      if (savedLanguage && TRANSLATIONS[savedLanguage]) {
        return savedLanguage;
      }
    } catch (error) {
      console.warn("Failed to read saved language preference:", error);
    }

    return "en";
  }

  let currentLanguage = getInitialLanguage();

  function t(key) {
    return (
      TRANSLATIONS[currentLanguage]?.[key] ||
      TRANSLATIONS.en?.[key] ||
      key
    );
  }

  function updateI18nText() {
    const doc = getDocument();

    /* istanbul ignore next */
    if (!doc) return;

    doc.querySelectorAll("[data-i18n]").forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });

    doc.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });

    doc.querySelectorAll("[data-i18n-title]").forEach(element => {
      element.title = t(element.dataset.i18nTitle);
    });

    doc.querySelectorAll("[data-i18n-alt]").forEach(element => {
      element.alt = t(element.dataset.i18nAlt);
    });

    doc.querySelectorAll(".language-switch button").forEach(button => {
      button.classList.toggle("active", button.dataset.lang === currentLanguage);
    });
  }

  const i18n = {
    changeLanguage(language) {
      if (!TRANSLATIONS[language]) return;

      const config = getConfig();
      const storage = getStorage();
      const doc = getDocument();

      currentLanguage = language;

      if (doc && doc.documentElement) {
        doc.documentElement.lang = language;
      }

      try {
        if (storage) {
          storage.setItem(config.LANGUAGE_KEY, language);
        }
      } catch (error) {
        console.warn("Failed to save language preference:", error);
      }

      updateI18nText();

      /* istanbul ignore else */
      if (
        typeof root.dispatchEvent === "function" &&
        typeof root.CustomEvent === "function"
      ) {
        root.dispatchEvent(
          new root.CustomEvent("languagechange", {
            detail: { language }
          })
        );
      }
    },

    getLanguage() {
      return currentLanguage;
    }
  };

  function initI18n() {
    const doc = getDocument();

    if (doc && doc.documentElement) {
      doc.documentElement.lang = currentLanguage;
    }

    updateI18nText();
  }

  const api = {
    TRANSLATIONS,
    t,
    i18n,
    updateI18nText,
    initI18n,
    getInitialLanguage
  };

  Object.keys(api).forEach(key => {
    root[key] = api[key];
  });

  /* istanbul ignore next */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
/* istanbul ignore next */
})(typeof globalThis !== "undefined" ? globalThis : window);
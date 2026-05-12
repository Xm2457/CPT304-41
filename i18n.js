// i18n.js
// Internationalization: externalized text + language switch
// This vanilla JavaScript version follows the same idea as React i18n:
// React: const { t, i18n } = useTranslation();
// Here: use t("key") and i18n.changeLanguage("en" / "zh").
// This file must be loaded after config.js and before budget.js.

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

let currentLanguage = getInitialLanguage();

function getInitialLanguage() {
  try {
    const savedLanguage = localStorage.getItem(CONFIG.LANGUAGE_KEY);
    if (savedLanguage && TRANSLATIONS[savedLanguage]) {
      return savedLanguage;
    }
  } catch (error) {
    console.warn("Failed to read saved language preference:", error);
  }

  return "en";
}

function t(key) {
  return (
    TRANSLATIONS[currentLanguage]?.[key] ||
    TRANSLATIONS.en?.[key] ||
    key
  );
}

const i18n = {
  changeLanguage(language) {
    if (!TRANSLATIONS[language]) return;

    currentLanguage = language;
    document.documentElement.lang = language;

    try {
      localStorage.setItem(CONFIG.LANGUAGE_KEY, language);
    } catch (error) {
      console.warn("Failed to save language preference:", error);
    }

    updateI18nText();
    window.dispatchEvent(new CustomEvent("languagechange", { detail: { language } }));
  },

  getLanguage() {
    return currentLanguage;
  }
};

function updateI18nText() {
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  document.querySelectorAll("[data-i18n-title]").forEach(element => {
    element.title = t(element.dataset.i18nTitle);
  });

  document.querySelectorAll("[data-i18n-alt]").forEach(element => {
    element.alt = t(element.dataset.i18nAlt);
  });

  document.querySelectorAll(".language-switch button").forEach(button => {
    button.classList.toggle("active", button.dataset.lang === currentLanguage);
  });
}

function initI18n() {
  document.documentElement.lang = currentLanguage;
  updateI18nText();
}
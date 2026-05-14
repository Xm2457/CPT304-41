// tests/i18n.test.js

describe("i18n.js", () => {
  let i18nModule;
  let t;
  let i18n;
  let initI18n;
  let updateI18nText;
  let getInitialLanguage;

  function setupDom() {
    document.documentElement.lang = "";

    document.body.innerHTML = `
      <h1 data-i18n="app.title.prefix"></h1>
      <span data-i18n="summary.balance"></span>
      <p data-i18n="button.addExpense"></p>

      <input data-i18n-placeholder="input.titlePlaceholder" />

      <button data-i18n-title="entry.edit"></button>

      <img data-i18n-alt="app.title.prefix" />

      <div class="language-switch">
        <button data-lang="en"></button>
        <button data-lang="zh"></button>
      </div>
    `;
  }

  function loadI18n() {
    jest.resetModules();

    setupDom();
    localStorage.clear();

    global.CONFIG = require("../config.js");

    i18nModule = require("../i18n.js");

    t = i18nModule.t;
    i18n = i18nModule.i18n;
    initI18n = i18nModule.initI18n;
    updateI18nText = i18nModule.updateI18nText;
    getInitialLanguage = i18nModule.getInitialLanguage;

    return i18nModule;
  }

  beforeEach(() => {
    loadI18n();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    document.documentElement.lang = "";

    delete global.CONFIG;

    jest.restoreAllMocks();
  });

  test("exports expected i18n API", () => {
    expect(i18nModule.TRANSLATIONS).toBeDefined();
    expect(typeof t).toBe("function");
    expect(typeof i18n.changeLanguage).toBe("function");
    expect(typeof i18n.getLanguage).toBe("function");
    expect(typeof initI18n).toBe("function");
    expect(typeof updateI18nText).toBe("function");
    expect(typeof getInitialLanguage).toBe("function");
  });

  test("t returns correct strings in default language", () => {
    expect(i18n.getLanguage()).toBe("en");
    expect(t("app.title.prefix")).toBe("Budget");
    expect(t("summary.balance")).toBe("Balance");
    expect(t("button.addExpense")).toBe("Add Expense");
  });

  test("t returns key itself when translation key does not exist", () => {
    expect(t("unknown.key")).toBe("unknown.key");
  });

  test("getInitialLanguage returns en by default", () => {
    expect(getInitialLanguage()).toBe("en");
  });

  test("getInitialLanguage reads saved zh language from localStorage", () => {
    jest.resetModules();

    setupDom();
    localStorage.clear();

    global.CONFIG = require("../config.js");
    localStorage.setItem("budget_app_language", "zh");

    const freshModule = require("../i18n.js");

    expect(freshModule.getInitialLanguage()).toBe("zh");
    expect(freshModule.i18n.getLanguage()).toBe("zh");
    expect(freshModule.t("app.title.prefix")).toBe("预算");
  });

  test("getInitialLanguage ignores unsupported saved language", () => {
    jest.resetModules();

    setupDom();
    localStorage.clear();

    global.CONFIG = require("../config.js");
    localStorage.setItem("budget_app_language", "es");

    const freshModule = require("../i18n.js");

    expect(freshModule.getInitialLanguage()).toBe("en");
    expect(freshModule.i18n.getLanguage()).toBe("en");
  });

  test("getInitialLanguage handles localStorage getItem error", () => {
    jest.resetModules();

    setupDom();
    localStorage.clear();

    global.CONFIG = require("../config.js");

    const getItemSpy = jest
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("read failed");
      });

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const freshModule = require("../i18n.js");

    expect(freshModule.getInitialLanguage()).toBe("en");
    expect(warnSpy).toHaveBeenCalledWith(
      "Failed to read saved language preference:",
      expect.any(Error)
    );

    getItemSpy.mockRestore();
  });

  test("i18n.changeLanguage switches language to Chinese", () => {
    i18n.changeLanguage("zh");

    expect(i18n.getLanguage()).toBe("zh");
    expect(t("app.title.prefix")).toBe("预算");
    expect(t("summary.balance")).toBe("余额");
    expect(t("button.addExpense")).toBe("添加支出");
  });

  test("i18n.changeLanguage ignores unsupported language", () => {
    i18n.changeLanguage("es");

    expect(i18n.getLanguage()).toBe("en");
    expect(t("app.title.prefix")).toBe("Budget");
    expect(localStorage.getItem("budget_app_language")).toBe(null);
  });

  test("i18n.changeLanguage saves selected language to localStorage", () => {
    i18n.changeLanguage("zh");

    expect(localStorage.getItem("budget_app_language")).toBe("zh");
  });

  test("i18n.changeLanguage uses default config key when CONFIG is missing", () => {
    jest.resetModules();

    setupDom();
    localStorage.clear();

    delete global.CONFIG;

    const freshModule = require("../i18n.js");

    freshModule.i18n.changeLanguage("zh");

    expect(localStorage.getItem("budget_app_language")).toBe("zh");
  });

  test("i18n.changeLanguage handles localStorage setItem error", () => {
    jest.resetModules();

    setupDom();
    localStorage.clear();

    global.CONFIG = require("../config.js");

    const setItemSpy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("save failed");
      });

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const freshModule = require("../i18n.js");

    expect(() => freshModule.i18n.changeLanguage("zh")).not.toThrow();
    expect(freshModule.i18n.getLanguage()).toBe("zh");

    expect(warnSpy).toHaveBeenCalledWith(
      "Failed to save language preference:",
      expect.any(Error)
    );

    setItemSpy.mockRestore();
  });

  test("i18n.changeLanguage updates document language", () => {
    i18n.changeLanguage("zh");

    expect(document.documentElement.lang).toBe("zh");
  });

  test("i18n.changeLanguage dispatches languagechange event", () => {
    const listener = jest.fn();

    window.addEventListener("languagechange", listener);

    i18n.changeLanguage("zh");

    expect(listener).toHaveBeenCalledTimes(1);

    const event = listener.mock.calls[0][0];

    expect(event.detail).toEqual({ language: "zh" });

    window.removeEventListener("languagechange", listener);
  });

  test("initI18n updates DOM text, placeholder, title and alt in English", () => {
    initI18n();

    expect(document.documentElement.lang).toBe("en");

    expect(
      document.querySelector("[data-i18n='app.title.prefix']").textContent
    ).toBe("Budget");

    expect(
      document.querySelector("[data-i18n='summary.balance']").textContent
    ).toBe("Balance");

    expect(
      document.querySelector("[data-i18n='button.addExpense']").textContent
    ).toBe("Add Expense");

    expect(
      document.querySelector("[data-i18n-placeholder='input.titlePlaceholder']").placeholder
    ).toBe("title");

    expect(
      document.querySelector("[data-i18n-title='entry.edit']").title
    ).toBe("Edit entry");

    expect(
      document.querySelector("[data-i18n-alt='app.title.prefix']").alt
    ).toBe("Budget");
  });

  test("i18n.changeLanguage updates DOM text after switching to Chinese", () => {
    initI18n();

    i18n.changeLanguage("zh");

    expect(document.documentElement.lang).toBe("zh");

    expect(
      document.querySelector("[data-i18n='app.title.prefix']").textContent
    ).toBe("预算");

    expect(
      document.querySelector("[data-i18n='summary.balance']").textContent
    ).toBe("余额");

    expect(
      document.querySelector("[data-i18n='button.addExpense']").textContent
    ).toBe("添加支出");

    expect(
      document.querySelector("[data-i18n-placeholder='input.titlePlaceholder']").placeholder
    ).toBe("标题");

    expect(
      document.querySelector("[data-i18n-title='entry.edit']").title
    ).toBe("编辑记录");

    expect(
      document.querySelector("[data-i18n-alt='app.title.prefix']").alt
    ).toBe("预算");
  });

  test("updateI18nText updates language switch active class", () => {
    initI18n();

    const enButton = document.querySelector("[data-lang='en']");
    const zhButton = document.querySelector("[data-lang='zh']");

    expect(enButton.classList.contains("active")).toBe(true);
    expect(zhButton.classList.contains("active")).toBe(false);

    i18n.changeLanguage("zh");

    expect(enButton.classList.contains("active")).toBe(false);
    expect(zhButton.classList.contains("active")).toBe(true);
  });

  test("updateI18nText can be called directly", () => {
    updateI18nText();

    expect(
      document.querySelector("[data-i18n='app.title.prefix']").textContent
    ).toBe("Budget");
  });
});
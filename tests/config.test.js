// tests/config.test.js

describe("config.js", () => {
  let CONFIG;

  beforeEach(() => {
    jest.resetModules();

    delete globalThis.CONFIG;

    CONFIG = require("../config.js");
  });

  afterEach(() => {
    delete globalThis.CONFIG;

    jest.restoreAllMocks();
  });

  test("exports CONFIG object", () => {
    expect(CONFIG).toBeDefined();
    expect(typeof CONFIG).toBe("object");
  });

  test("contains storage-related keys", () => {
    expect(CONFIG.STORAGE_KEY).toBe("entry_list");
    expect(CONFIG.LANGUAGE_KEY).toBe("budget_app_language");
    expect(CONFIG.COOKIE_CONSENT_KEY).toBe("cookieConsent");
  });

  test("contains currency sign", () => {
    expect(CONFIG.CURRENCY_SIGN).toBe("$");
  });

  test("contains color configuration", () => {
    expect(CONFIG.COLORS).toEqual({
      income: "#FFFFFF",
      expense: "#F0624D"
    });
  });

  test("contains chart configuration", () => {
    expect(CONFIG.CHART).toEqual({
      WIDTH: 50,
      HEIGHT: 50,
      RADIUS: 20,
      LINE_WIDTH: 8
    });
  });

  test("attaches CONFIG to globalThis", () => {
    expect(globalThis.CONFIG).toBe(CONFIG);
  });

  test("CONFIG contains all expected top-level keys", () => {
    expect(Object.keys(CONFIG).sort()).toEqual([
      "CHART",
      "COLORS",
      "COOKIE_CONSENT_KEY",
      "CURRENCY_SIGN",
      "LANGUAGE_KEY",
      "STORAGE_KEY"
    ]);
  });
});
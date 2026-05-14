// tests/budget.test.js

describe("budget.js", () => {
  let budget;

  function setupDom() {
    document.body.innerHTML = `
      <div class="balance">
        <div class="value"></div>
      </div>

      <div class="income-total"></div>
      <div class="outcome-total"></div>

      <div id="expense">
        <ul class="list"></ul>
      </div>

      <div id="income">
        <ul class="list"></ul>
      </div>

      <div id="all">
        <ul class="list"></ul>
      </div>

      <button class="first-tab"></button>
      <button class="second-tab"></button>
      <button class="third-tab"></button>

      <button class="add-expense"></button>
      <input id="expense-title-input" />
      <input id="expense-amount-input" />

      <button class="add-income"></button>
      <input id="income-title-input" />
      <input id="income-amount-input" />

      <div id="cookie-banner" class="hide"></div>
      <button id="accept-cookie"></button>
      <button id="reject-cookie"></button>
    `;
  }

  function setupGlobals() {
    global.CONFIG = require("../config.js");

    global.t = jest.fn(key => {
      const messages = {
        "entry.edit": "Edit entry",
        "entry.delete": "Delete entry",
        "error.titleLength": "Title must be between 2 and 50 characters.",
        "error.invalidTitle": "Invalid characters detected in title.",
        "error.amountRange": "Please enter a valid amount between 0 and 1,000,000.",
        "error.storageSave": "Entry added but could not be saved due to browser storage limitations."
      };

      return messages[key] || key;
    });

    global.initI18n = jest.fn();
    global.updateChart = jest.fn();
    global.alert = jest.fn();
  }

  function loadBudget() {
    jest.resetModules();

    setupDom();
    localStorage.clear();
    setupGlobals();

    budget = require("../budget.js");

    return budget;
  }

  beforeEach(() => {
    loadBudget();
  });

  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";

    delete global.CONFIG;
    delete global.t;
    delete global.initI18n;
    delete global.updateChart;
    delete global.alert;

    jest.restoreAllMocks();
  });

  test("initializes without throwing when DOM and globals are ready", () => {
    expect(budget).toBeDefined();
    expect(global.initI18n).toHaveBeenCalled();
    expect(document.querySelector(".balance .value").innerHTML).toBe("<small>$</small>0.00");
  });

  test("calculateTotal calculates income and expense totals", () => {
    const entries = [
      { type: "income", title: "Salary", amount: 1000 },
      { type: "expense", title: "Rent", amount: 400 },
      { type: "income", title: "Bonus", amount: 200 }
    ];

    expect(budget.calculateTotal("income", entries)).toBe(1200);
    expect(budget.calculateTotal("expense", entries)).toBe(400);
  });

  test("calculateBalance returns income minus outcome", () => {
    expect(budget.calculateBalance(1000, 300)).toBe(700);
    expect(budget.calculateBalance(300, 1000)).toBe(-700);
  });

  test("formatAmount formats number to two decimal places", () => {
    expect(budget.formatAmount(10)).toBe("10.00");
    expect(budget.formatAmount(10.5)).toBe("10.50");
    expect(budget.formatAmount("8")).toBe("8.00");
  });

  test("isValidEntry validates correct entries", () => {
    expect(
      budget.isValidEntry({
        type: "income",
        title: "Salary",
        amount: 100
      })
    ).toBe(true);

    expect(
      budget.isValidEntry({
        type: "expense",
        title: "Food",
        amount: 20
      })
    ).toBe(true);
  });

  test("isValidEntry rejects invalid entries", () => {
    expect(budget.isValidEntry(null)).toBe(false);
    expect(budget.isValidEntry({ type: "saving", title: "Bad", amount: 10 })).toBe(false);
    expect(budget.isValidEntry({ type: "income", title: "", amount: 10 })).toBe(false);
    expect(budget.isValidEntry({ type: "income", title: "Bad", amount: 0 })).toBe(false);
    expect(budget.isValidEntry({ type: "income", title: "Bad", amount: "abc" })).toBe(false);
  });

  test("normalizeEntry trims title and converts amount to number", () => {
    expect(
      budget.normalizeEntry({
        type: "income",
        title: "  Salary  ",
        amount: "100"
      })
    ).toEqual({
      type: "income",
      title: "Salary",
      amount: 100
    });
  });

  test("getValidatedEntry returns valid income entry", () => {
    const titleInput = document.createElement("input");
    const amountInput = document.createElement("input");

    titleInput.value = "Salary";
    amountInput.value = "1000";

    expect(budget.getValidatedEntry("income", titleInput, amountInput)).toEqual({
      type: "income",
      title: "Salary",
      amount: 1000
    });
  });

  test("getValidatedEntry rejects short title", () => {
    const titleInput = document.createElement("input");
    const amountInput = document.createElement("input");

    titleInput.value = "A";
    amountInput.value = "100";

    expect(budget.getValidatedEntry("income", titleInput, amountInput)).toBe(null);
    expect(global.alert).toHaveBeenCalledWith("Title must be between 2 and 50 characters.");
  });

  test("getValidatedEntry rejects title longer than 50 characters", () => {
    const titleInput = document.createElement("input");
    const amountInput = document.createElement("input");

    titleInput.value = "A".repeat(51);
    amountInput.value = "100";

    expect(budget.getValidatedEntry("income", titleInput, amountInput)).toBe(null);
    expect(global.alert).toHaveBeenCalledWith("Title must be between 2 and 50 characters.");
  });

  test("getValidatedEntry rejects dangerous HTML title", () => {
    const titleInput = document.createElement("input");
    const amountInput = document.createElement("input");

    titleInput.value = "<script>alert(1)</script>";
    amountInput.value = "100";

    expect(budget.getValidatedEntry("income", titleInput, amountInput)).toBe(null);
    expect(global.alert).toHaveBeenCalledWith("Invalid characters detected in title.");
  });

  test("getValidatedEntry rejects invalid amount", () => {
    const titleInput = document.createElement("input");
    const amountInput = document.createElement("input");

    titleInput.value = "Salary";
    amountInput.value = "-10";

    expect(budget.getValidatedEntry("income", titleInput, amountInput)).toBe(null);
    expect(global.alert).toHaveBeenCalledWith("Please enter a valid amount between 0 and 1,000,000.");
  });

  test("getValidatedEntry rejects amount greater than 1000000", () => {
    const titleInput = document.createElement("input");
    const amountInput = document.createElement("input");

    titleInput.value = "Salary";
    amountInput.value = "1000001";

    expect(budget.getValidatedEntry("income", titleInput, amountInput)).toBe(null);
    expect(global.alert).toHaveBeenCalledWith("Please enter a valid amount between 0 and 1,000,000.");
  });

  test("adds income entry through button click", () => {
    document.getElementById("income-title-input").value = "Salary";
    document.getElementById("income-amount-input").value = "1000";

    document.querySelector(".add-income").click();

    expect(budget.getEntries()).toEqual([
      {
        type: "income",
        title: "Salary",
        amount: 1000
      }
    ]);

    expect(document.querySelector("#income .list").textContent).toContain("Salary : $1000.00");
    expect(document.querySelector("#all .list").textContent).toContain("Salary : $1000.00");
    expect(document.querySelector(".balance .value").innerHTML).toBe("<small>$</small>1000.00");
    expect(global.updateChart).toHaveBeenLastCalledWith(1000, 0);
  });

  test("does not add income when validation fails", () => {
    document.getElementById("income-title-input").value = "A";
    document.getElementById("income-amount-input").value = "1000";

    document.querySelector(".add-income").click();

    expect(budget.getEntries()).toEqual([]);
  });

  test("adds expense entry through button click", () => {
    document.getElementById("expense-title-input").value = "Food";
    document.getElementById("expense-amount-input").value = "25";

    document.querySelector(".add-expense").click();

    expect(budget.getEntries()).toEqual([
      {
        type: "expense",
        title: "Food",
        amount: 25
      }
    ]);

    expect(document.querySelector("#expense .list").textContent).toContain("Food : $25.00");
    expect(document.querySelector("#all .list").textContent).toContain("Food : $25.00");
    expect(document.querySelector(".balance .value").innerHTML).toBe("<small>-$</small>25.00");
    expect(global.updateChart).toHaveBeenLastCalledWith(0, 25);
  });

  test("does not add expense when validation fails", () => {
    document.getElementById("expense-title-input").value = "F";
    document.getElementById("expense-amount-input").value = "25";

    document.querySelector(".add-expense").click();

    expect(budget.getEntries()).toEqual([]);
  });

  test("clears input after adding income", () => {
    const titleInput = document.getElementById("income-title-input");
    const amountInput = document.getElementById("income-amount-input");

    titleInput.value = "Salary";
    amountInput.value = "1000";

    document.querySelector(".add-income").click();

    expect(titleInput.value).toBe("");
    expect(amountInput.value).toBe("");
  });

  test("updateUI renders multiple entries and totals", () => {
    budget.setEntries([
      { type: "income", title: "Salary", amount: 1000 },
      { type: "expense", title: "Food", amount: 100 },
      { type: "expense", title: "Transport", amount: 50 }
    ]);

    expect(document.querySelector(".income-total").innerHTML).toBe("<small>$</small>1000.00");
    expect(document.querySelector(".outcome-total").innerHTML).toBe("<small>$</small>150.00");
    expect(document.querySelector(".balance .value").innerHTML).toBe("<small>$</small>850.00");

    expect(document.querySelector("#income .list").textContent).toContain("Salary : $1000.00");
    expect(document.querySelector("#expense .list").textContent).toContain("Food : $100.00");
    expect(document.querySelector("#expense .list").textContent).toContain("Transport : $50.00");
    expect(document.querySelector("#all .list").textContent).toContain("Salary : $1000.00");
  });

  test("updateUI returns safely when DOM is missing before initialization", () => {
    jest.resetModules();

    document.body.innerHTML = "";

    global.CONFIG = require("../config.js");
    global.t = jest.fn(key => key);
    global.initI18n = jest.fn();
    global.updateChart = jest.fn();
    global.alert = jest.fn();

    const freshBudget = require("../budget.js");

    expect(() => freshBudget.updateUI()).not.toThrow();
  });

  test("deleteEntry removes entry and updates UI", () => {
    budget.setEntries([
      { type: "income", title: "Salary", amount: 1000 },
      { type: "expense", title: "Food", amount: 100 }
    ]);

    const firstEntry = document.querySelector("#all .list li[id='0']");

    budget.deleteEntry(firstEntry);

    expect(budget.getEntries()).toEqual([
      {
        type: "expense",
        title: "Food",
        amount: 100
      }
    ]);

    expect(document.querySelector(".balance .value").innerHTML).toBe("<small>-$</small>100.00");
  });

  test("deleteEntry ignores invalid index", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const li = document.createElement("li");
    li.id = "99";

    expect(() => budget.deleteEntry(li)).not.toThrow();

    expect(warnSpy).toHaveBeenCalledWith("Invalid entry index for deletion:", 99);
  });

  test("editEntry moves income entry back to input fields and removes it", () => {
    budget.setEntries([
      { type: "income", title: "Salary", amount: 1000 }
    ]);

    const entry = document.querySelector("#income .list li[id='0']");

    budget.editEntry(entry);

    expect(document.getElementById("income-title-input").value).toBe("Salary");
    expect(document.getElementById("income-amount-input").value).toBe("1000");
    expect(budget.getEntries()).toEqual([]);
  });

  test("editEntry moves expense entry back to input fields and removes it", () => {
    budget.setEntries([
      { type: "expense", title: "Food", amount: 25 }
    ]);

    const entry = document.querySelector("#expense .list li[id='0']");

    budget.editEntry(entry);

    expect(document.getElementById("expense-title-input").value).toBe("Food");
    expect(document.getElementById("expense-amount-input").value).toBe("25");
    expect(budget.getEntries()).toEqual([]);
  });

  test("editEntry ignores invalid index", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const li = document.createElement("li");
    li.id = "99";

    expect(() => budget.editEntry(li)).not.toThrow();

    expect(warnSpy).toHaveBeenCalledWith("Invalid entry index for editing:", 99);
  });

  test("clicking delete button removes entry", () => {
    budget.setEntries([
      { type: "income", title: "Salary", amount: 1000 }
    ]);

    const deleteBtn = document.querySelector("#income .list li[id='0'] #delete");

    deleteBtn.click();

    expect(budget.getEntries()).toEqual([]);
  });

  test("clicking edit button edits entry", () => {
    budget.setEntries([
      { type: "income", title: "Salary", amount: 1000 }
    ]);

    const editBtn = document.querySelector("#income .list li[id='0'] #edit");

    editBtn.click();

    expect(document.getElementById("income-title-input").value).toBe("Salary");
    expect(document.getElementById("income-amount-input").value).toBe("1000");
    expect(budget.getEntries()).toEqual([]);
  });

  test("deleteOrEdit returns early when target is not inside li", () => {
    const event = {
      target: document.createElement("button")
    };

    expect(() => budget.deleteOrEdit(event)).not.toThrow();
  });

  test("deleteOrEdit ignores unknown button id", () => {
    budget.setEntries([
      { type: "income", title: "Salary", amount: 1000 }
    ]);

    const li = document.querySelector("#income .list li[id='0']");
    const unknownButton = document.createElement("button");

    unknownButton.id = "unknown";
    li.appendChild(unknownButton);

    unknownButton.click();

    expect(budget.getEntries()).toEqual([
      { type: "income", title: "Salary", amount: 1000 }
    ]);
  });

  test("tab buttons show and hide sections", () => {
    const expenseEl = document.querySelector("#expense");
    const incomeEl = document.querySelector("#income");
    const allEl = document.querySelector("#all");

    document.querySelector(".second-tab").click();

    expect(incomeEl.classList.contains("hide")).toBe(false);
    expect(expenseEl.classList.contains("hide")).toBe(true);
    expect(allEl.classList.contains("hide")).toBe(true);

    document.querySelector(".third-tab").click();

    expect(allEl.classList.contains("hide")).toBe(false);
    expect(incomeEl.classList.contains("hide")).toBe(true);
    expect(expenseEl.classList.contains("hide")).toBe(true);

    document.querySelector(".first-tab").click();

    expect(expenseEl.classList.contains("hide")).toBe(false);
    expect(incomeEl.classList.contains("hide")).toBe(true);
    expect(allEl.classList.contains("hide")).toBe(true);
  });

  test("cookie banner shows when no consent exists", () => {
    const banner = document.getElementById("cookie-banner");

    expect(banner.classList.contains("hide")).toBe(false);
  });

  test("cookie banner is hidden when consent already exists", () => {
    jest.resetModules();

    localStorage.clear();
    localStorage.setItem("cookieConsent", "accepted");

    setupDom();

    global.CONFIG = require("../config.js");
    global.t = jest.fn(key => key);
    global.initI18n = jest.fn();
    global.updateChart = jest.fn();
    global.alert = jest.fn();

    const freshBudget = require("../budget.js");

    freshBudget.initCookieBanner();

    expect(document.getElementById("cookie-banner").classList.contains("hide")).toBe(true);
  });

  test("initCookieBanner returns safely when banner elements are missing", () => {
    document.getElementById("cookie-banner").remove();

    expect(() => budget.initCookieBanner()).not.toThrow();
  });

  test("accept cookie stores accepted consent and hides banner", () => {
    const banner = document.getElementById("cookie-banner");

    document.getElementById("accept-cookie").click();

    expect(localStorage.getItem("cookieConsent")).toBe("accepted");
    expect(banner.classList.contains("hide")).toBe(true);
  });

  test("reject cookie stores rejected consent and hides banner", () => {
    const banner = document.getElementById("cookie-banner");

    document.getElementById("reject-cookie").click();

    expect(localStorage.getItem("cookieConsent")).toBe("rejected");
    expect(banner.classList.contains("hide")).toBe(true);
  });

  test("loadEntries returns empty array when storage is empty", () => {
    localStorage.removeItem("entry_list");

    expect(budget.loadEntries()).toEqual([]);
  });

  test("loadEntries loads valid saved entries", () => {
    localStorage.setItem(
      "entry_list",
      JSON.stringify([
        { type: "income", title: " Salary ", amount: "1000" },
        { type: "expense", title: "Food", amount: 25 }
      ])
    );

    expect(budget.loadEntries()).toEqual([
      { type: "income", title: "Salary", amount: 1000 },
      { type: "expense", title: "Food", amount: 25 }
    ]);
  });

  test("loadEntries filters invalid saved entries", () => {
    localStorage.setItem(
      "entry_list",
      JSON.stringify([
        { type: "income", title: "Salary", amount: 1000 },
        { type: "bad", title: "Bad", amount: 20 },
        { type: "expense", title: "", amount: 10 }
      ])
    );

    expect(budget.loadEntries()).toEqual([
      { type: "income", title: "Salary", amount: 1000 }
    ]);
  });

  test("loadEntries resets storage when saved data is not an array", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    localStorage.setItem("entry_list", JSON.stringify({ bad: true }));

    expect(budget.loadEntries()).toEqual([]);
    expect(localStorage.getItem("entry_list")).toBe(null);
    expect(warnSpy).toHaveBeenCalledWith("Stored data is not an array, resetting.");
  });

  test("loadEntries handles invalid JSON safely", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    localStorage.setItem("entry_list", "{invalid json");

    expect(budget.loadEntries()).toEqual([]);
    expect(localStorage.getItem("entry_list")).toBe(null);
    expect(errorSpy).toHaveBeenCalled();
  });

  test("saveEntries stores entries in localStorage", () => {
    budget.setEntries([
      { type: "income", title: "Salary", amount: 1000 }
    ]);

    const saved = JSON.parse(localStorage.getItem("entry_list"));

    expect(saved).toEqual([
      { type: "income", title: "Salary", amount: 1000 }
    ]);
  });

  test("saveEntries handles localStorage setItem error", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const setItemSpy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("save failed");
      });

    budget.setEntries([
      { type: "income", title: "Salary", amount: 1000 }
    ]);

    expect(errorSpy).toHaveBeenCalled();
    expect(global.alert).toHaveBeenCalledWith(
      "Entry added but could not be saved due to browser storage limitations."
    );

    setItemSpy.mockRestore();
  });

  test("clearInput clears values and custom validity", () => {
    const input = document.createElement("input");

    input.value = "abc";
    input.setCustomValidity("error");

    budget.clearInput([input]);

    expect(input.value).toBe("");
    expect(input.validationMessage).toBe("");
  });

  test("clearElement clears innerHTML", () => {
    const div = document.createElement("div");

    div.innerHTML = "<span>Hello</span>";

    budget.clearElement([div]);

    expect(div.innerHTML).toBe("");
  });

  test("clearElement ignores null elements", () => {
    expect(() => budget.clearElement([null])).not.toThrow();
  });

  test("show, hide, active and inactive update classes", () => {
    const div = document.createElement("div");

    div.className = "hide";

    budget.show(div);
    expect(div.classList.contains("hide")).toBe(false);

    budget.hide([div]);
    expect(div.classList.contains("hide")).toBe(true);

    budget.active(div);
    expect(div.classList.contains("focus")).toBe(true);

    budget.inactive([div]);
    expect(div.classList.contains("focus")).toBe(false);
  });

  test("show, hide, active and inactive ignore null elements", () => {
    expect(() => budget.show(null)).not.toThrow();
    expect(() => budget.hide([null])).not.toThrow();
    expect(() => budget.active(null)).not.toThrow();
    expect(() => budget.inactive([null])).not.toThrow();
  });

  test("setEntries uses empty array when argument is not an array", () => {
    budget.setEntries("bad data");

    expect(budget.getEntries()).toEqual([]);
  });

  test("getTotals returns current income, outcome and balance", () => {
    budget.setEntries([
      { type: "income", title: "Salary", amount: 1000 },
      { type: "expense", title: "Food", amount: 250 }
    ]);

    expect(budget.getTotals()).toEqual({
      income: 1000,
      outcome: 250,
      balance: 750
    });
  });

  test("initBudget returns false when required DOM elements are missing", () => {
    jest.resetModules();

    document.body.innerHTML = "";

    global.CONFIG = require("../config.js");
    global.t = jest.fn(key => key);
    global.initI18n = jest.fn();
    global.updateChart = jest.fn();
    global.alert = jest.fn();

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const freshBudget = require("../budget.js");

    expect(freshBudget.initBudget()).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith("Budget DOM elements not found.");
  });

  test("autoInitBudget registers DOMContentLoaded when DOM is not ready", () => {
    jest.resetModules();

    document.body.innerHTML = "";

    global.CONFIG = require("../config.js");
    global.t = jest.fn(key => key);
    global.initI18n = jest.fn();
    global.updateChart = jest.fn();
    global.alert = jest.fn();

    const addEventSpy = jest.spyOn(document, "addEventListener");

    require("../budget.js");

    expect(addEventSpy).toHaveBeenCalledWith(
      "DOMContentLoaded",
      expect.any(Function),
      { once: true }
    );
  });
});
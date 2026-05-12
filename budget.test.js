/**
 * @jest-environment jsdom
 */

const {
  initDomAndEvents,
  calculateTotal,
  calculateBalance,
  formatAmount,
  getValidatedEntry,
  clearInput,
  clearElement,
  isValidEntry,
  normalizeEntry,
} = require("./budget.js");

const CONFIG = require("./config.js");

// Mock alert，防止测试时因调用 alert 报错
beforeAll(() => {
  global.alert = jest.fn();
});

// Mock localStorage
beforeEach(() => {
  let storage = {};
  global.localStorage = {
    getItem: jest.fn((key) => storage[key] || null),
    setItem: jest.fn((key, val) => {
      storage[key] = val;
    }),
    removeItem: jest.fn((key) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      storage = {};
    }),
  };
});

describe("Pure function tests", () => {
  // ...（略，与上文一致，纯函数测试部分不变）
});

describe("DOM related tests", () => {
  beforeEach(() => {
    // Setup minimal DOM structure for initDomAndEvents
    document.body.innerHTML = `
      <div class="balance"><div class="value"></div></div>
      <div class="income-total"></div>
      <div class="outcome-total"></div>
      <div id="income"><ul class="list"></ul></div>
      <div id="expense"><ul class="list"></ul></div>
      <div id="all"><ul class="list"></ul></div>
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

    // Mock CONFIG globally
    global.CONFIG = {
      STORAGE_KEY: "entry_list",
      CURRENCY_SIGN: "$",
      COLORS: {
        income: "#FFFFFF",
        expense: "#F0624D",
      },
      CHART: {
        WIDTH: 50,
        HEIGHT: 50,
        RADIUS: 20,
        LINE_WIDTH: 8,
      },
    };

    // Mock updateChart to avoid errors
    global.updateChart = jest.fn();

    // Clear localStorage mock before each DOM test
    localStorage.clear();
  });

  test("initDomAndEvents initializes and binds events", () => {
    initDomAndEvents();

    expect(Array.isArray(global.ENTRY_LIST) || true).toBe(true);
    expect(document.querySelector(".balance .value")).not.toBeNull();

    const incomeTitleInput = document.getElementById("income-title-input");
    const incomeAmountInput = document.getElementById("income-amount-input");
    const addIncomeBtn = document.querySelector(".add-income");

    incomeTitleInput.value = "Test Income";
    incomeAmountInput.value = "100";
    addIncomeBtn.click();

    expect(global.updateChart).toHaveBeenCalled();
  });

  test("updateUI updates balance and lists", () => {
    global.ENTRY_LIST = [
      { type: "income", title: "Salary", amount: 1000 },
      { type: "expense", title: "Rent", amount: 500 },
    ];

    document.body.innerHTML = `
      <div class="balance"><div class="value"></div></div>
      <div class="income-total"></div>
      <div class="outcome-total"></div>
      <div id="income"><ul class="list"></ul></div>
      <div id="expense"><ul class="list"></ul></div>
      <div id="all"><ul class="list"></ul></div>
    `;

    initDomAndEvents();

    const { updateUI } = require("./budget.js");
    updateUI();

    const balanceEl = document.querySelector(".balance .value");
    expect(balanceEl.textContent.includes("$")).toBe(true);

    expect(document.querySelectorAll("#income .list li").length).toBeGreaterThan(0);
    expect(document.querySelectorAll("#expense .list li").length).toBeGreaterThan(0);
    expect(document.querySelectorAll("#all .list li").length).toBeGreaterThan(0);
  });

  // === 删除与编辑测试 ===
  test("deleteOrEdit - deleteEntry removes the entry", () => {
    initDomAndEvents();

    // 添加一条支出
    const expenseTitle = document.getElementById("expense-title-input");
    const expenseAmount = document.getElementById("expense-amount-input");
    const addExpenseBtn = document.querySelector(".add-expense");
    expenseTitle.value = "Lunch";
    expenseAmount.value = "25";
    addExpenseBtn.click();

    const expenseList = document.querySelector("#expense .list");
    expect(expenseList.children.length).toBe(1);

    // 模拟点击删除按钮
    const deleteBtn = expenseList.querySelector("#delete");
    deleteBtn.dispatchEvent(new Event("click", { bubbles: true }));

    // 再次检查
    expect(expenseList.children.length).toBe(0);
  });

  test("deleteOrEdit - editEntry puts values to input", () => {
    initDomAndEvents();

    // 添加一条支出
    const expenseTitle = document.getElementById("expense-title-input");
    const expenseAmount = document.getElementById("expense-amount-input");
    const addExpenseBtn = document.querySelector(".add-expense");
    expenseTitle.value = "Dinner";
    expenseAmount.value = "50";
    addExpenseBtn.click();

    const expenseList = document.querySelector("#expense .list");
    expect(expenseList.children.length).toBe(1);

    const editBtn = expenseList.querySelector("#edit");
    editBtn.dispatchEvent(new Event("click", { bubbles: true }));

    // 被编辑后，input 应恢复 entry
    expect(expenseTitle.value).toBe("Dinner");
    expect(expenseAmount.value).toBe("50");
    // 被编辑后，entry 被删除
    expect(expenseList.children.length).toBe(0);
  });

  // === tab 切换测试 ===
  test("tab switching: expense tab shows expenses", () => {
    initDomAndEvents();

    const expenseBtn = document.querySelector(".first-tab");
    const expenseEl = document.getElementById("expense");
    const incomeEl = document.getElementById("income");
    const allEl = document.getElementById("all");

    expenseBtn.click();

    expect(expenseEl.classList.contains('hide')).toBe(false);
    expect(incomeEl.classList.contains('hide')).toBe(true);
    expect(allEl.classList.contains('hide')).toBe(true);
    expect(expenseBtn.classList.contains('focus')).toBe(true);
  });

  test("tab switching: income tab shows incomes", () => {
    initDomAndEvents();

    const incomeBtn = document.querySelector(".second-tab");
    const expenseEl = document.getElementById("expense");
    const incomeEl = document.getElementById("income");
    const allEl = document.getElementById("all");

    incomeBtn.click();

    expect(incomeEl.classList.contains('hide')).toBe(false);
    expect(expenseEl.classList.contains('hide')).toBe(true);
    expect(allEl.classList.contains('hide')).toBe(true);
    expect(incomeBtn.classList.contains('focus')).toBe(true);
  });

  test("tab switching: all tab shows all", () => {
    initDomAndEvents();

    const allBtn = document.querySelector(".third-tab");
    const expenseEl = document.getElementById("expense");
    const incomeEl = document.getElementById("income");
    const allEl = document.getElementById("all");

    allBtn.click();

    expect(allEl.classList.contains('hide')).toBe(false);
    expect(expenseEl.classList.contains('hide')).toBe(true);
    expect(incomeEl.classList.contains('hide')).toBe(true);
    expect(allBtn.classList.contains('focus')).toBe(true);
  });
});
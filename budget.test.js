/**
 * @jest-environment jsdom
 */

require('jest-canvas-mock');

// Mock CONFIG before importing
const mockConfig = {
  STORAGE_KEY: "entry_list",
  CURRENCY_SIGN: "$",
  COLORS: {
    income: "#FFFFFF",
    expense: "#F0624D",
  },
  CHART: {
    WIDTH: 500,
    HEIGHT: 500,
    RADIUS: 200,
    LINE_WIDTH: 8,
  },
};

// Setup DOM function
function setupFullDOM() {
  document.body.innerHTML = `
    <div class="budget-container">
      <div class="budget-header">
        <div class="balance">
          <div class="title">Balance</div>
          <div class="value"><small>$</small>0</div>
        </div>
        <div class="account">
          <div class="income">
            <div class="title">Income</div>
            <div class="income-total"><small>$</small>0</div>
          </div>
          <div class="chart"></div>
          <div class="outcome">
            <div class="title">Outcome</div>
            <div class="outcome-total"><small>$</small>0</div>
          </div>
        </div>
      </div>
      <div class="budget-dashboard">
        <div class="dash-title">Dashboard</div>
        <div class="toggle">
          <div class="first-tab">Expenses</div>
          <div class="second-tab">Income</div>
          <div class="third-tab focus">All</div>
        </div>
        <div class="hide" id="expense">
          <ul class="list"></ul>
          <div class="input">
            <input type="text" id="expense-title-input" placeholder="title" />
            <input type="number" id="expense-amount-input" placeholder="$0" />
            <div class="add-expense"><img src="icon/plus.png" alt="+"></div>
          </div>
        </div>
        <div class="hide" id="income">
          <ul class="list"></ul>
          <div class="input">
            <input type="text" id="income-title-input" placeholder="title" />
            <input type="number" id="income-amount-input" placeholder="$0" />
            <div class="add-income"><img src="icon/plus.png" alt="+"></div>
          </div>
        </div>
        <div id="all">
          <ul class="list"></ul>
        </div>
      </div>
    </div>
    <div id="cookie-banner" class="cookie-banner hide">
      <button id="accept-cookie">Accept All</button>
      <button id="reject-cookie">Reject</button>
    </div>
  `;
}

describe("Budget.js Tests", () => {
  let budgetModule;

  beforeAll(() => {
    global.alert = jest.fn();
    global.updateChart = jest.fn();
  });

  beforeEach(() => {
    jest.resetModules();
    setupFullDOM();

    global.CONFIG = { ...mockConfig };

    // Setup localStorage mock
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

    // Import module after DOM and CONFIG are set
    budgetModule = require("./budget.js");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // PURE FUNCTION TESTS
  // =========================
  describe("Pure function tests", () => {
    test("calculateTotal returns correct sum", () => {
      const list = [
        { type: "income", amount: 100 },
        { type: "expense", amount: 50 },
        { type: "income", amount: 200 },
      ];
      expect(budgetModule.calculateTotal("income", list)).toBe(300);
      expect(budgetModule.calculateTotal("expense", list)).toBe(50);
    });

    test("calculateBalance returns correct difference", () => {
      expect(budgetModule.calculateBalance(1000, 500)).toBe(500);
      expect(budgetModule.calculateBalance(500, 1000)).toBe(-500);
    });

    test("formatAmount formats to two decimal places", () => {
      expect(budgetModule.formatAmount(100)).toBe("100.00");
      expect(budgetModule.formatAmount(100.5)).toBe("100.50");
    });

    test("getValidatedEntry validates input correctly", () => {
      const titleInput = { value: "Test", trim: () => "Test" };
      const amountInput = { value: "100" };

      const result = budgetModule.getValidatedEntry("income", titleInput, amountInput);
      expect(result).toEqual({ type: "income", title: "Test", amount: 100 });
    });

    test("getValidatedEntry rejects invalid title", () => {
      const titleInput = { value: "a", trim: () => "a" };
      const amountInput = { value: "100" };

      const result = budgetModule.getValidatedEntry("income", titleInput, amountInput);
      expect(result).toBeNull();
      expect(global.alert).toHaveBeenCalled();
    });

    test("isValidEntry validates entry correctly", () => {
      const validEntry = { type: "income", title: "Salary", amount: 1000 };
      const invalidEntry = { type: "invalid", title: "", amount: -10 };

      expect(budgetModule.isValidEntry(validEntry)).toBe(true);
      expect(budgetModule.isValidEntry(invalidEntry)).toBe(false);
      expect(budgetModule.isValidEntry(null)).toBe(false);
    });

    test("normalizeEntry cleans entry data", () => {
      const rawEntry = { type: "income", title: "  Salary  ", amount: "1000" };
      const normalized = budgetModule.normalizeEntry(rawEntry);

      expect(normalized).toEqual({ type: "income", title: "Salary", amount: 1000 });
    });

    test("clearInput clears input fields", () => {
      const input1 = { value: "test", setCustomValidity: jest.fn() };
      const input2 = { value: "123", setCustomValidity: jest.fn() };

      budgetModule.clearInput([input1, input2]);

      expect(input1.value).toBe("");
      expect(input2.value).toBe("");
    });

    test("clearElement clears element content", () => {
      const div1 = document.createElement("div");
      const div2 = document.createElement("div");
      div1.innerHTML = "<span>content</span>";
      div2.innerHTML = "<span>content</span>";

      budgetModule.clearElement([div1, div2]);

      expect(div1.innerHTML).toBe("");
      expect(div2.innerHTML).toBe("");
    });
  });

  // =========================
  // DOM RELATED TESTS
  // =========================
  describe("DOM related tests", () => {
    test("initDomAndEvents initializes and binds events", () => {
      const { initDomAndEvents } = budgetModule;
      initDomAndEvents();

      const incomeTitleInput = document.getElementById("income-title-input");
      const incomeAmountInput = document.getElementById("income-amount-input");
      const addIncomeBtn = document.querySelector(".add-income");

      incomeTitleInput.value = "Test Income";
      incomeAmountInput.value = "100";
      addIncomeBtn.click();

      expect(global.updateChart).toHaveBeenCalled();
    });

    test("addExpense adds expense entry", () => {
      const { initDomAndEvents } = budgetModule;
      initDomAndEvents();

      const expenseTitle = document.getElementById("expense-title-input");
      const expenseAmount = document.getElementById("expense-amount-input");
      const addExpenseBtn = document.querySelector(".add-expense");
      const expenseList = document.querySelector("#expense .list");

      expenseTitle.value = "Groceries";
      expenseAmount.value = "150";
      addExpenseBtn.click();

      expect(expenseList.children.length).toBe(1);
    });

    test("addIncome adds income entry", () => {
      const { initDomAndEvents } = budgetModule;
      initDomAndEvents();

      const incomeTitle = document.getElementById("income-title-input");
      const incomeAmount = document.getElementById("income-amount-input");
      const addIncomeBtn = document.querySelector(".add-income");
      const incomeList = document.querySelector("#income .list");

      incomeTitle.value = "Salary";
      incomeAmount.value = "5000";
      addIncomeBtn.click();

      expect(incomeList.children.length).toBe(1);
    });

    test("deleteOrEdit - deleteEntry removes the entry", () => {
      const { initDomAndEvents } = budgetModule;
      initDomAndEvents();

      const expenseTitle = document.getElementById("expense-title-input");
      const expenseAmount = document.getElementById("expense-amount-input");
      const addExpenseBtn = document.querySelector(".add-expense");

      expenseTitle.value = "Lunch";
      expenseAmount.value = "25";
      addExpenseBtn.click();

      const expenseList = document.querySelector("#expense .list");
      expect(expenseList.children.length).toBe(1);

      const deleteBtn = expenseList.querySelector("#delete");
      deleteBtn.dispatchEvent(new Event("click", { bubbles: true }));

      expect(expenseList.children.length).toBe(0);
    });

    test("deleteOrEdit - editEntry puts values to input", () => {
      const { initDomAndEvents } = budgetModule;
      initDomAndEvents();

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

      expect(expenseTitle.value).toBe("Dinner");
      expect(parseFloat(expenseAmount.value)).toBe(50);
      expect(expenseList.children.length).toBe(0);
    });

    // Tab switching tests
    test("tab switching: expense tab shows expenses", () => {
      const { initDomAndEvents } = budgetModule;
      initDomAndEvents();

      const expenseBtn = document.querySelector(".first-tab");
      const expenseEl = document.getElementById("expense");
      const incomeEl = document.getElementById("income");
      const allEl = document.getElementById("all");

      expenseBtn.click();

      expect(expenseEl.classList.contains("hide")).toBe(false);
      expect(incomeEl.classList.contains("hide")).toBe(true);
      expect(allEl.classList.contains("hide")).toBe(true);
      expect(expenseBtn.classList.contains("focus")).toBe(true);
    });

    test("tab switching: income tab shows incomes", () => {
      const { initDomAndEvents } = budgetModule;
      initDomAndEvents();

      const incomeBtn = document.querySelector(".second-tab");
      const expenseEl = document.getElementById("expense");
      const incomeEl = document.getElementById("income");
      const allEl = document.getElementById("all");

      incomeBtn.click();

      expect(incomeEl.classList.contains("hide")).toBe(false);
      expect(expenseEl.classList.contains("hide")).toBe(true);
      expect(allEl.classList.contains("hide")).toBe(true);
      expect(incomeBtn.classList.contains("focus")).toBe(true);
    });

    test("tab switching: all tab shows all", () => {
      const { initDomAndEvents } = budgetModule;
      initDomAndEvents();

      const allBtn = document.querySelector(".third-tab");
      const expenseEl = document.getElementById("expense");
      const incomeEl = document.getElementById("income");
      const allEl = document.getElementById("all");

      allBtn.click();

      expect(allEl.classList.contains("hide")).toBe(false);
      expect(expenseEl.classList.contains("hide")).toBe(true);
      expect(incomeEl.classList.contains("hide")).toBe(true);
      expect(allBtn.classList.contains("focus")).toBe(true);
    });

    // Balance calculation tests
    test("balance shows positive sign when income > expense", () => {
      const { initDomAndEvents } = budgetModule;
      initDomAndEvents();

      const incomeTitle = document.getElementById("income-title-input");
      const incomeAmount = document.getElementById("income-amount-input");
      const addIncomeBtn = document.querySelector(".add-income");
      const expenseTitle = document.getElementById("expense-title-input");
      const expenseAmount = document.getElementById("expense-amount-input");
      const addExpenseBtn = document.querySelector(".add-expense");

      incomeTitle.value = "Salary";
      incomeAmount.value = "5000";
      addIncomeBtn.click();

      expenseTitle.value = "Rent";
      expenseAmount.value = "1500";
      addExpenseBtn.click();

      const balanceEl = document.querySelector(".balance .value");
      expect(balanceEl.innerHTML).toContain("$");
      expect(balanceEl.innerHTML).not.toContain("-$");
    });

    test("balance shows negative sign when expense > income", () => {
      const { initDomAndEvents } = budgetModule;
      initDomAndEvents();

      const incomeTitle = document.getElementById("income-title-input");
      const incomeAmount = document.getElementById("income-amount-input");
      const addIncomeBtn = document.querySelector(".add-income");
      const expenseTitle = document.getElementById("expense-title-input");
      const expenseAmount = document.getElementById("expense-amount-input");
      const addExpenseBtn = document.querySelector(".add-expense");

      incomeTitle.value = "Salary";
      incomeAmount.value = "3000";
      addIncomeBtn.click();

      expenseTitle.value = "Rent";
      expenseAmount.value = "3500";
      addExpenseBtn.click();

      const balanceEl = document.querySelector(".balance .value");
      expect(balanceEl.innerHTML).toContain("-$");
    });
  });
});
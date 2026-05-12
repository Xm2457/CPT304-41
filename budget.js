// budget.js
const CONFIG = require('./config.js');

let balanceEl, incomeTotalEl, outcomeTotalEl;
let incomeEl, expenseEl, allEl;
let incomeList, expenseList, allList;
let expenseBtn, incomeBtn, allBtn;
let addExpense, expenseTitle, expenseAmount;
let addIncome, incomeTitle, incomeAmount;

const DELETE = "delete";
const EDIT = "edit";

let ENTRY_LIST = [];
let balance = 0, income = 0, outcome = 0;

// ========== PURE FUNCTIONS ==========

function calculateTotal(type, list) {
  return list.reduce((sum, entry) => (entry.type === type ? sum + entry.amount : sum), 0);
}

function calculateBalance(income, outcome) {
  return income - outcome;
}

function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

function getValidatedEntry(type, titleInput, amountInput) {
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);

  if (title.length < 2 || title.length > 50) {
    alert("Title must be between 2 and 50 characters.");
    return null;
  }

  const dangerousPattern = /[<>]|<.*?>/gi;
  if (dangerousPattern.test(title)) {
    alert("Invalid characters detected in title.");
    return null;
  }

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
    alert("Please enter a valid amount between 0 and 1,000,000.");
    return null;
  }

  return {
    type,
    title,
    amount,
  };
}

function clearInput(inputs) {
  inputs.forEach(input => {
    input.value = "";
    if (typeof input.setCustomValidity === "function") {
      input.setCustomValidity("");
    }
  });
}

function clearElement(elements) {
  elements.forEach(element => {
    element.innerHTML = "";
  });
}

function isValidEntry(entry) {
  if (!entry) return false;
  return (
    (entry.type === "income" || entry.type === "expense") &&
    typeof entry.title === "string" &&
    entry.title.trim() !== "" &&
    Number.isFinite(entry.amount) &&
    entry.amount > 0
  );
}

function normalizeEntry(entry) {
  return {
    type: entry.type,
    title: entry.title.trim(),
    amount: Number(entry.amount),
  };
}

// ========== DOM & EVENT INITIALIZATION ==========

let domEventsInitialized = false;
function initDomAndEvents() {
  if (domEventsInitialized) return;
  domEventsInitialized = true;

  balanceEl = document.querySelector(".balance .value");
  incomeTotalEl = document.querySelector(".income-total");
  outcomeTotalEl = document.querySelector(".outcome-total");
  incomeEl = document.querySelector("#income");
  expenseEl = document.querySelector("#expense");
  allEl = document.querySelector("#all");
  incomeList = document.querySelector("#income .list");
  expenseList = document.querySelector("#expense .list");
  allList = document.querySelector("#all .list");

  expenseBtn = document.querySelector(".first-tab");
  incomeBtn = document.querySelector(".second-tab");
  allBtn = document.querySelector(".third-tab");

  addExpense = document.querySelector(".add-expense");
  expenseTitle = document.getElementById("expense-title-input");
  expenseAmount = document.getElementById("expense-amount-input");

  addIncome = document.querySelector(".add-income");
  incomeTitle = document.getElementById("income-title-input");
  incomeAmount = document.getElementById("income-amount-input");

  ENTRY_LIST = loadEntries();

  addExpense && addExpense.addEventListener("click", () => {
    const expense = getValidatedEntry("expense", expenseTitle, expenseAmount);
    if (!expense) return;

    ENTRY_LIST.push(expense);
    updateUI();
    clearInput([expenseTitle, expenseAmount]);
  });

  addIncome && addIncome.addEventListener("click", () => {
    const income = getValidatedEntry("income", incomeTitle, incomeAmount);
    if (!income) return;

    ENTRY_LIST.push(income);
    updateUI();
    clearInput([incomeTitle, incomeAmount]);
  });

  incomeList && incomeList.addEventListener("click", deleteOrEdit);
  expenseList && expenseList.addEventListener("click", deleteOrEdit);
  allList && allList.addEventListener("click", deleteOrEdit);

  initTabSwitching();
  initCookieBanner();

  updateUI();
}

// ========== UI FUNCTIONS ==========

function updateUI() {
  income = calculateTotal("income", ENTRY_LIST);
  outcome = calculateTotal("expense", ENTRY_LIST);
  balance = calculateBalance(income, outcome);

  const sign = balance >= 0 ? CONFIG.CURRENCY_SIGN : `-${CONFIG.CURRENCY_SIGN}`;

  if (balanceEl) balanceEl.innerHTML = `<small>${sign}</small>${formatAmount(Math.abs(balance))}`;
  if (outcomeTotalEl) outcomeTotalEl.innerHTML = `<small>${CONFIG.CURRENCY_SIGN}</small>${formatAmount(outcome)}`;
  if (incomeTotalEl) incomeTotalEl.innerHTML = `<small>${CONFIG.CURRENCY_SIGN}</small>${formatAmount(income)}`;

  if (expenseList && incomeList && allList) {
    clearElement([expenseList, incomeList, allList]);
    ENTRY_LIST.forEach((entry, index) => {
      if (entry.type === "expense") {
        showEntry(expenseList, entry.type, entry.title, entry.amount, index);
      } else if (entry.type === "income") {
        showEntry(incomeList, entry.type, entry.title, entry.amount, index);
      }
      showEntry(allList, entry.type, entry.title, entry.amount, index);
    });
  }

  if (typeof updateChart === "function") {
    updateChart(income, outcome);
  }

  saveEntries();
}

function showEntry(list, type, title, amount, id) {
  if (!list) return;

  const entry = document.createElement("li");
  entry.id = id;
  entry.className = type;

  const entryText = document.createElement("div");
  entryText.className = "entry";
  entryText.textContent = `${title} : ${CONFIG.CURRENCY_SIGN}${formatAmount(amount)}`;

  const editBtn = document.createElement("div");
  editBtn.id = EDIT;
  editBtn.title = "Edit entry";

  const deleteBtn = document.createElement("div");
  deleteBtn.id = DELETE;
  deleteBtn.title = "Delete entry";

  entry.append(entryText, editBtn, deleteBtn);
  list.prepend(entry);
}

function deleteOrEdit(event) {
  const targetBtn = event.target;
  const entryLi = targetBtn.closest("li");
  if (!entryLi) return;
  if (targetBtn.id === EDIT) {
    editEntry(entryLi);
  } else if (targetBtn.id === DELETE) {
    deleteEntry(entryLi);
  }
}

function deleteEntry(entryLi) {
  const index = Number(entryLi.id);
  if (!Number.isInteger(index) || index < 0 || index >= ENTRY_LIST.length) {
    console.warn("Invalid entry index for deletion:", index);
    return;
  }
  ENTRY_LIST.splice(index, 1);
  updateUI();
}

function editEntry(entryLi) {
  const index = Number(entryLi.id);
  if (!Number.isInteger(index) || index < 0 || index >= ENTRY_LIST.length) {
    console.warn("Invalid entry index for editing:", index);
    return;
  }
  const entry = ENTRY_LIST[index];
  if (entry.type === "income") {
    incomeTitle.value = entry.title;
    incomeAmount.value = entry.amount;
  } else if (entry.type === "expense") {
    expenseTitle.value = entry.title;
    expenseAmount.value = entry.amount;
  }
  deleteEntry(entryLi);
}

// ========== TAB SWITCHING ==========

function initTabSwitching() {
  expenseBtn && expenseBtn.addEventListener("click", () => {
    show(expenseEl);
    hide([incomeEl, allEl]);
    active(expenseBtn);
    inactive([incomeBtn, allBtn]);
  });

  incomeBtn && incomeBtn.addEventListener("click", () => {
    show(incomeEl);
    hide([expenseEl, allEl]);
    active(incomeBtn);
    inactive([expenseBtn, allBtn]);
  });

  allBtn && allBtn.addEventListener("click", () => {
    show(allEl);
    hide([incomeEl, expenseEl]);
    active(allBtn);
    inactive([incomeBtn, expenseBtn]);
  });
}

// ========== COOKIE BANNER ==========

function initCookieBanner() {
  // 可选，测试环境可不实现
}

// ========== UI DISPLAY/HIDE AND ACTIVE STATE MANAGEMENT ==========

function show(element) {
  if (!element) return;
  element.classList.remove("hide");
}

function hide(elements) {
  elements.forEach(el => {
    if (el) el.classList.add("hide");
  });
}

function active(element) {
  if (!element) return;
  element.classList.add("focus");
}

function inactive(elements) {
  elements.forEach(el => {
    if (el) el.classList.remove("focus");
  });
}

function loadEntries() {
  try {
    const rawEntries = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!rawEntries) return [];
    const parsed = JSON.parse(rawEntries);
    if (!Array.isArray(parsed)) {
      console.warn("Stored data is not an array, resetting.");
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      return [];
    }
    return parsed.filter(isValidEntry).map(normalizeEntry);
  } catch (err) {
    console.error("Failed to load entries:", err);
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    return [];
  }
}

function saveEntries() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(ENTRY_LIST));
  } catch (err) {
    console.error("Failed to save entries:", err);
    alert("Entry added but could not be saved due to browser storage limitations.");
  }
}

// ========== EXPORTS ==========

module.exports = {
  initDomAndEvents,
  calculateTotal,
  calculateBalance,
  formatAmount,
  getValidatedEntry,
  clearInput,
  clearElement,
  isValidEntry,
  normalizeEntry,
  updateUI,
  ENTRY_LIST,
};
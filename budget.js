// budget.js

// =========================
// VARIABLES (DOM elements will be initialized later)
// =========================
let balanceEl, incomeTotalEl, outcomeTotalEl;
let incomeEl, expenseEl, allEl;
let incomeList, expenseList, allList;
let expenseBtn, incomeBtn, allBtn;
let addExpense, expenseTitle, expenseAmount;
let addIncome, incomeTitle, incomeAmount;

// =========================
// CONSTANTS
// =========================
const DELETE = "delete";
const EDIT = "edit";

// =========================
// DATA
// =========================
let ENTRY_LIST = [];
let balance = 0,
  income = 0,
  outcome = 0;

// =========================
// PURE FUNCTIONS (no DOM dependencies)
// =========================

// Calculate total amount by type
function calculateTotal(type, list) {
  return list.reduce((sum, entry) => (entry.type === type ? sum + entry.amount : sum), 0);
}

// Calculate balance
function calculateBalance(income, outcome) {
  return income - outcome;
}

// Format amount to two decimals
function formatAmount(amount) {
  return amount.toFixed(2);
}

// Validate input and return entry object or null
function getValidatedEntry(type, titleInput, amountInput) {
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);

  if (title.length < 2 || title.length > 50) {
    alert("Title must be between 2 and 50 characters.");
    return null;
  }

  const dangerousPattern = /[<>]|&lt;.*?&gt;/gi;
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

// Clear input fields and reset validation state
function clearInput(inputs) {
  inputs.forEach(input => {
    input.value = "";
    if (typeof input.setCustomValidity === "function") {
      input.setCustomValidity("");
    }
  });
}

// Clear content of multiple elements
function clearElement(elements) {
  elements.forEach(element => {
    element.innerHTML = "";
  });
}

// Validate entry legitimacy
function isValidEntry(entry) {
  return (
    entry &&
    (entry.type === "income" || entry.type === "expense") &&
    typeof entry.title === "string" &&
    entry.title.trim() !== "" &&
    Number.isFinite(entry.amount) &&
    entry.amount > 0
  );
}

// Clean up entry data format
function normalizeEntry(entry) {
  return {
    type: entry.type,
    title: entry.title.trim(),
    amount: Number(entry.amount),
  };
}

// =========================
// DOM & EVENT INITIALIZATION
// =========================

function initDomAndEvents() {
  // Query DOM elements
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

  // Load entries from localStorage
  ENTRY_LIST = loadEntries();

  // Bind events
  addExpense.addEventListener("click", () => {
    const expense = getValidatedEntry("expense", expenseTitle, expenseAmount);
    if (!expense) return;

    ENTRY_LIST.push(expense);
    updateUI();
    clearInput([expenseTitle, expenseAmount]);
  });

  addIncome.addEventListener("click", () => {
    const income = getValidatedEntry("income", incomeTitle, incomeAmount);
    if (!income) return;

    ENTRY_LIST.push(income);
    updateUI();
    clearInput([incomeTitle, incomeAmount]);
  });

  incomeList.addEventListener("click", deleteOrEdit);
  expenseList.addEventListener("click", deleteOrEdit);
  allList.addEventListener("click", deleteOrEdit);

  initTabSwitching();
  initCookieBanner();

  // Initial UI update
  updateUI();
}

// =========================
// UI FUNCTIONS
// =========================

// Update UI
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

// Display a single entry
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

// Delete or edit handler
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

// Delete entry
function deleteEntry(entryLi) {
  const index = Number(entryLi.id);

  if (!Number.isInteger(index) || index < 0 || index >= ENTRY_LIST.length) {
    console.warn("Invalid entry index for deletion:", index);
    return;
  }

  ENTRY_LIST.splice(index, 1);
  updateUI();
}

// Edit entry
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

// =========================
// TAB SWITCHING
// =========================

function initTabSwitching() {
  expenseBtn.addEventListener("click", () => {
    show(expenseEl);
    hide([incomeEl, allEl]);
    active(expenseBtn);
    inactive([incomeBtn, allBtn]);
  });

  incomeBtn.addEventListener("click", () => {
    show(incomeEl);
    hide([expenseEl, allEl]);
    active(incomeBtn);
    inactive([expenseBtn, allBtn]);
  });

  allBtn.addEventListener("click", () => {
    show(allEl);
    hide([incomeEl, expenseEl]);
    active(allBtn);
    inactive([incomeBtn, expenseBtn]);
  });
}

// =========================
// COOKIE BANNER RELATED LOGIC
// =========================

function initCookieBanner() {
  document.addEventListener("DOMContentLoaded", () => {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("accept-cookie");
    const rejectBtn = document.getElementById("reject-cookie");

    if (!cookieBanner || !acceptBtn || !rejectBtn) return;

    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      cookieBanner.classList.remove("hide");
    } else {
      cookieBanner.classList.add("hide");
    }

    acceptBtn.addEventListener("click", () => {
      localStorage.setItem("cookieConsent", "accepted");
      cookieBanner.classList.add("hide");
    });

    rejectBtn.addEventListener("click", () => {
      localStorage.setItem("cookieConsent", "rejected");
      cookieBanner.classList.add("hide");
    });
  });
}

// =========================
// UI DISPLAY/HIDE AND ACTIVE STATE MANAGEMENT
// =========================

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

// =========================
// LOCAL STORAGE
// =========================

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

// =========================
// EXPORTS
// =========================

// 导出纯函数和初始化函数
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
  // 如果需要导出其他函数也可以加
};
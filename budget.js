// budget.js
// Depends on CONFIG from config.js and t()/i18n/initI18n() from i18n.js.
// Please ensure config.js and i18n.js are loaded before this file.

// =========================
// SELECT ELEMENTS
// =========================
const balanceEl = document.querySelector(".balance .value");
const incomeTotalEl = document.querySelector(".income-total");
const outcomeTotalEl = document.querySelector(".outcome-total");
const incomeEl = document.querySelector("#income");
const expenseEl = document.querySelector("#expense");
const allEl = document.querySelector("#all");
const incomeList = document.querySelector("#income .list");
const expenseList = document.querySelector("#expense .list");
const allList = document.querySelector("#all .list");

// SELECT BUTTONS
const expenseBtn = document.querySelector(".first-tab");
const incomeBtn = document.querySelector(".second-tab");
const allBtn = document.querySelector(".third-tab");

// INPUT BUTTONS AND INPUTS
const addExpense = document.querySelector(".add-expense");
const expenseTitle = document.getElementById("expense-title-input");
const expenseAmount = document.getElementById("expense-amount-input");

const addIncome = document.querySelector(".add-income");
const incomeTitle = document.getElementById("income-title-input");
const incomeAmount = document.getElementById("income-amount-input");

// =========================
// CONSTANTS
// =========================
const DELETE = "delete";
const EDIT = "edit";

// =========================
// VARIABLES
// =========================
let ENTRY_LIST = loadEntries();
let balance = 0;
let income = 0;
let outcome = 0;

// =========================
// INITIALIZATION
// =========================
initI18n();
updateUI();
initCookieBanner();
initTabSwitching();

window.addEventListener("languagechange", () => {
  updateUI();
});

// =========================
// EVENT LISTENERS
// =========================

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

// =========================
// FUNCTION DEFINITIONS
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

function updateUI() {
  income = calculateTotal("income", ENTRY_LIST);
  outcome = calculateTotal("expense", ENTRY_LIST);
  balance = calculateBalance(income, outcome);

  const sign = balance >= 0 ? CONFIG.CURRENCY_SIGN : `-${CONFIG.CURRENCY_SIGN}`;

  balanceEl.innerHTML = `<small>${sign}</small>${formatAmount(Math.abs(balance))}`;
  outcomeTotalEl.innerHTML = `<small>${CONFIG.CURRENCY_SIGN}</small>${formatAmount(outcome)}`;
  incomeTotalEl.innerHTML = `<small>${CONFIG.CURRENCY_SIGN}</small>${formatAmount(income)}`;

  clearElement([expenseList, incomeList, allList]);

  ENTRY_LIST.forEach((entry, index) => {
    if (entry.type === "expense") {
      showEntry(expenseList, entry.type, entry.title, entry.amount, index);
    } else if (entry.type === "income") {
      showEntry(incomeList, entry.type, entry.title, entry.amount, index);
    }

    showEntry(allList, entry.type, entry.title, entry.amount, index);
  });

  if (typeof updateChart === "function") {
    updateChart(income, outcome);
  }

  saveEntries();
}

function showEntry(list, type, title, amount, id) {
  const entry = document.createElement("li");
  entry.id = id;
  entry.className = type;

  const entryText = document.createElement("div");
  entryText.className = "entry";
  entryText.textContent = `${title} : ${CONFIG.CURRENCY_SIGN}${formatAmount(amount)}`;

  const editBtn = document.createElement("div");
  editBtn.id = EDIT;
  editBtn.title = t("entry.edit");

  const deleteBtn = document.createElement("div");
  deleteBtn.id = DELETE;
  deleteBtn.title = t("entry.delete");

  entry.append(entryText, editBtn, deleteBtn);
  list.prepend(entry);
}

function getValidatedEntry(type, titleInput, amountInput) {
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);

  if (title.length < 2 || title.length > 50) {
    alert(t("error.titleLength"));
    return null;
  }

  const dangerousPattern = /<script|<\/script>|<.*?>/gi;
  if (dangerousPattern.test(title)) {
    alert(t("error.invalidTitle"));
    return null;
  }

  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
    alert(t("error.amountRange"));
    return null;
  }

  return {
    type,
    title,
    amount
  };
}

function clearInput(inputs) {
  inputs.forEach(input => {
    input.value = "";
    input.setCustomValidity("");
  });
}

function clearElement(elements) {
  elements.forEach(element => {
    element.innerHTML = "";
  });
}

function calculateTotal(type, list) {
  return list.reduce((sum, entry) => (entry.type === type ? sum + entry.amount : sum), 0);
}

function calculateBalance(income, outcome) {
  return income - outcome;
}

function formatAmount(amount) {
  return Number(amount).toFixed(2);
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
    alert(t("error.storageSave"));
  }
}

function isValidEntry(entry) {
  return (
    entry &&
    (entry.type === "income" || entry.type === "expense") &&
    typeof entry.title === "string" &&
    entry.title.trim() !== "" &&
    Number.isFinite(Number(entry.amount)) &&
    Number(entry.amount) > 0
  );
}

function normalizeEntry(entry) {
  return {
    type: entry.type,
    title: entry.title.trim(),
    amount: Number(entry.amount)
  };
}

function initCookieBanner() {
  const cookieBanner = document.getElementById("cookie-banner");
  const acceptBtn = document.getElementById("accept-cookie");
  const rejectBtn = document.getElementById("reject-cookie");

  if (!cookieBanner || !acceptBtn || !rejectBtn) return;

  const consent = localStorage.getItem(CONFIG.COOKIE_CONSENT_KEY);
  if (!consent) {
    cookieBanner.classList.remove("hide");
  } else {
    cookieBanner.classList.add("hide");
  }

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem(CONFIG.COOKIE_CONSENT_KEY, "accepted");
    cookieBanner.classList.add("hide");
  });

  rejectBtn.addEventListener("click", () => {
    localStorage.setItem(CONFIG.COOKIE_CONSENT_KEY, "rejected");
    cookieBanner.classList.add("hide");
  });
}

function show(element) {
  element.classList.remove("hide");
}

function hide(elements) {
  elements.forEach(el => el.classList.add("hide"));
}

function active(element) {
  element.classList.add("focus");
}

function inactive(elements) {
  elements.forEach(el => el.classList.remove("focus"));
}
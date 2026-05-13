<<<<<<< HEAD
// budget.js
// Depends on CONFIG from config.js and t()/i18n/initI18n() from i18n.js.
// Please ensure config.js and i18n.js are loaded before this file.

// =========================
=======
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
// SELECT ELEMENTS
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

// VARIABLES
let ENTRY_LIST = loadEntries();
let balance = 0;
let income = 0;
let outcome = 0;

<<<<<<< HEAD
// =========================
// INITIALIZATION
// =========================
initI18n();
=======
const DELETE = "delete",
  EDIT = "edit";

>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
updateUI();

<<<<<<< HEAD
window.addEventListener("languagechange", () => {
  updateUI();
});

// =========================
=======
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
// EVENT LISTENERS
expenseBtn.addEventListener("click", function () {
  show(expenseEl);
  hide([incomeEl, allEl]);
  active(expenseBtn);
  inactive([incomeBtn, allBtn]);
});

<<<<<<< HEAD
addExpense.addEventListener("click", () => {
=======
incomeBtn.addEventListener("click", function () {
  show(incomeEl);
  hide([expenseEl, allEl]);
  active(incomeBtn);
  inactive([expenseBtn, allBtn]);
});

allBtn.addEventListener("click", function () {
  show(allEl);
  hide([incomeEl, expenseEl]);
  active(allBtn);
  inactive([incomeBtn, expenseBtn]);
});

addExpense.addEventListener("click", function () {
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
  const expense = getValidatedEntry("expense", expenseTitle, expenseAmount);
  if (!expense) return;

  ENTRY_LIST.push(expense);
  updateUI();
  clearInput([expenseTitle, expenseAmount]);
});

<<<<<<< HEAD
addIncome.addEventListener("click", () => {
=======
addIncome.addEventListener("click", function () {
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
  const income = getValidatedEntry("income", incomeTitle, incomeAmount);
  if (!income) return;

  ENTRY_LIST.push(income);
  updateUI();
  clearInput([incomeTitle, incomeAmount]);
});

incomeList.addEventListener("click", deleteOrEdit);
expenseList.addEventListener("click", deleteOrEdit);
allList.addEventListener("click", deleteOrEdit);

<<<<<<< HEAD
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

=======
// HELPER FUNCTIONS
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
function deleteOrEdit(event) {
  const targetBtn = event.target;
  const entry = targetBtn.closest("li");

  if (!entry) return;

  if (targetBtn.id === EDIT) {
    editEntry(entry);
  } else if (targetBtn.id === DELETE) {
    deleteEntry(entry);
  }
}

<<<<<<< HEAD
function deleteEntry(entryLi) {
  const index = Number(entryLi.id);
=======
function deleteEntry(entry) {
  const index = Number(entry.id);
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6

  if (!Number.isInteger(index) || index < 0 || index >= ENTRY_LIST.length) {
    console.warn("Invalid entry index:", entry.id);
    return;
  }

  ENTRY_LIST.splice(index, 1);
  updateUI();
}

<<<<<<< HEAD
function editEntry(entryLi) {
  const index = Number(entryLi.id);
=======
function editEntry(entry) {
  const index = Number(entry.id);
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6

  // Prevent editing non-existent data
  if (!Number.isInteger(index) || index < 0 || index >= ENTRY_LIST.length) {
    console.warn("Invalid entry index:", entry.id);
    return;
  }

<<<<<<< HEAD
  const entry = ENTRY_LIST[index];

  if (entry.type === "income") {
    incomeTitle.value = entry.title;
    incomeAmount.value = entry.amount;
  } else if (entry.type === "expense") {
    expenseTitle.value = entry.title;
    expenseAmount.value = entry.amount;
=======
  const ENTRY = ENTRY_LIST[index];

  if (ENTRY.type === "income") {
    incomeTitle.value = ENTRY.title;
    incomeAmount.value = ENTRY.amount;
  } else if (ENTRY.type === "expense") {
    expenseTitle.value = ENTRY.title;
    expenseAmount.value = ENTRY.amount;
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
  }

  deleteEntry(entry);
}

function updateUI() {
  income = calculateTotal("income", ENTRY_LIST);
  outcome = calculateTotal("expense", ENTRY_LIST);
  balance = Math.abs(calculateBalance(income, outcome));

  const sign = income >= outcome ? CONFIG.CURRENCY_SIGN : `-${CONFIG.CURRENCY_SIGN}`;

  // UPDATE UI
  balanceEl.innerHTML = `<small>${sign}</small>${formatAmount(balance)}`;
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

  // Prevent the entire page from reporting an error when chart.js is not loaded correctly
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

  // Use textContent to avoid the risk of page injection caused by users entering HTML/ scripts
  entryText.textContent = `${title} : ${CONFIG.CURRENCY_SIGN}${formatAmount(amount)}`;

  const editBtn = document.createElement("div");
  editBtn.id = EDIT;
<<<<<<< HEAD
  editBtn.title = t("entry.edit");

  const deleteBtn = document.createElement("div");
  deleteBtn.id = DELETE;
  deleteBtn.title = t("entry.delete");
=======

  const deleteBtn = document.createElement("div");
  deleteBtn.id = DELETE;
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6

  entry.append(entryText, editBtn, deleteBtn);
  list.prepend(entry);
}

function getValidatedEntry(type, titleInput, amountInput) {
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);

<<<<<<< HEAD
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
=======
  // The title cannot be empty, nor can only Spaces be entered
  if (!title) {
    setInputError(titleInput, "Please enter a title.");
    return null;
  }

  // The amount must be a significant figure and greater than 0
  if (!Number.isFinite(amount) || amount <= 0) {
    setInputError(amountInput, "Please enter an amount greater than 0.");
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
    return null;
  }

  return {
    type,
    title,
    amount
  };
}

<<<<<<< HEAD
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

=======
function setInputError(input, message) {
  input.setCustomValidity(message);
  input.reportValidity();

  // After the user re-enters, clear the previous error status
  input.addEventListener(
    "input",
    function () {
      input.setCustomValidity("");
    },
    { once: true }
  );
}

>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
function loadEntries() {
  try {
    const rawEntries = localStorage.getItem(CONFIG.STORAGE_KEY);

    if (!rawEntries) return [];

    const parsedEntries = JSON.parse(rawEntries);

    // Prevent the data in localStorage from not being an array
    if (!Array.isArray(parsedEntries)) {
      console.warn("Saved entries are not an array. Resetting data.");
      localStorage.removeItem(CONFIG.STORAGE_KEY);
      return [];
    }

  
    return parsedEntries.filter(isValidEntry).map(normalizeEntry);
  } catch (error) {
    // Prevent JSON corruption from causing page initialization failure
    console.error("Failed to load saved entries:", error);
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    return [];
  }
}

function saveEntries() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(ENTRY_LIST));
<<<<<<< HEAD
  } catch (err) {
    console.error("Failed to save entries:", err);
    alert(t("error.storageSave"));
=======
  } catch (error) {
    // localStorage The write may fail due to reasons such as the browser's privacy mode or capacity limit
    console.error("Failed to save entries:", error);
    alert("The entry was added, but it could not be saved in this browser.");
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
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

<<<<<<< HEAD
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
=======
function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

function clearElement(elements) {
  elements.forEach((element) => {
    element.innerHTML = "";
  });
}

function calculateTotal(type, list) {
  let sum = 0;

  list.forEach((entry) => {
    if (entry.type === type) {
      sum += entry.amount;
    }
  });

  return sum;
}

function calculateBalance(income, outcome) {
  return income - outcome;
}

function clearInput(inputs) {
  inputs.forEach((input) => {
    input.value = "";
    input.setCustomValidity("");
>>>>>>> 5187aa4e57b4d5f53fdb19fb759ee9ae8705e7e6
  });
}

function show(element) {
  element.classList.remove("hide");
}

function hide(elements) {
  elements.forEach((element) => {
    element.classList.add("hide");
  });
}

function active(element) {
  element.classList.add("focus");
}

function inactive(elements) {
  elements.forEach((element) => {
    element.classList.remove("focus");
  });
}
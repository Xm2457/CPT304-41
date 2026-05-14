// budget.js
// Budget app logic with browser support and Jest/CommonJS test support.

(function (root) {
  const DELETE = "delete";
  const EDIT = "edit";

  let ENTRY_LIST = [];
  let balance = 0;
  let income = 0;
  let outcome = 0;
  let initialized = false;

  let els = {};

  function getConfig() {
    return root.CONFIG || {
      STORAGE_KEY: "entry_list",
      COOKIE_CONSENT_KEY: "cookieConsent",
      CURRENCY_SIGN: "$"
    };
  }

  function getDocument() {
    return root.document || null;
  }

  function getStorage() {
    try {
      return root.localStorage || null;
    } catch (error) {
      console.warn("localStorage is not available:", error);
      return null;
    }
  }

  function translate(key) {
    if (typeof root.t === "function") {
      return root.t(key);
    }

    return key;
  }

  function notify(message) {
    if (typeof root.alert === "function") {
      root.alert(message);
    }
  }

  function cacheElements() {
    const doc = getDocument();

    if (!doc) return false;

    els = {
      balanceEl: doc.querySelector(".balance .value"),
      incomeTotalEl: doc.querySelector(".income-total"),
      outcomeTotalEl: doc.querySelector(".outcome-total"),

      incomeEl: doc.querySelector("#income"),
      expenseEl: doc.querySelector("#expense"),
      allEl: doc.querySelector("#all"),

      incomeList: doc.querySelector("#income .list"),
      expenseList: doc.querySelector("#expense .list"),
      allList: doc.querySelector("#all .list"),

      expenseBtn: doc.querySelector(".first-tab"),
      incomeBtn: doc.querySelector(".second-tab"),
      allBtn: doc.querySelector(".third-tab"),

      addExpense: doc.querySelector(".add-expense"),
      expenseTitle: doc.getElementById("expense-title-input"),
      expenseAmount: doc.getElementById("expense-amount-input"),

      addIncome: doc.querySelector(".add-income"),
      incomeTitle: doc.getElementById("income-title-input"),
      incomeAmount: doc.getElementById("income-amount-input")
    };

    const requiredElements = [
      els.balanceEl,
      els.incomeTotalEl,
      els.outcomeTotalEl,
      els.incomeEl,
      els.expenseEl,
      els.allEl,
      els.incomeList,
      els.expenseList,
      els.allList,
      els.expenseBtn,
      els.incomeBtn,
      els.allBtn,
      els.addExpense,
      els.expenseTitle,
      els.expenseAmount,
      els.addIncome,
      els.incomeTitle,
      els.incomeAmount
    ];

    return requiredElements.every(Boolean);
  }

  function initBudget() {
    if (!cacheElements()) {
      console.warn("Budget DOM elements not found.");
      return false;
    }

    ENTRY_LIST = loadEntries();

    if (typeof root.initI18n === "function") {
      root.initI18n();
    }

    updateUI();
    initCookieBanner();
    initTabSwitching();
    initEntryButtons();

    if (!initialized && typeof root.addEventListener === "function") {
      root.addEventListener("languagechange", () => {
        updateUI();
      });

      initialized = true;
    }

    return true;
  }

  function initEntryButtons() {
    els.addExpense.addEventListener("click", () => {
      const expense = getValidatedEntry("expense", els.expenseTitle, els.expenseAmount);

      if (!expense) return;

      ENTRY_LIST.push(expense);
      updateUI();
      clearInput([els.expenseTitle, els.expenseAmount]);
    });

    els.addIncome.addEventListener("click", () => {
      const incomeEntry = getValidatedEntry("income", els.incomeTitle, els.incomeAmount);

      if (!incomeEntry) return;

      ENTRY_LIST.push(incomeEntry);
      updateUI();
      clearInput([els.incomeTitle, els.incomeAmount]);
    });

    els.incomeList.addEventListener("click", deleteOrEdit);
    els.expenseList.addEventListener("click", deleteOrEdit);
    els.allList.addEventListener("click", deleteOrEdit);
  }

  function initTabSwitching() {
    els.expenseBtn.addEventListener("click", () => {
      show(els.expenseEl);
      hide([els.incomeEl, els.allEl]);
      active(els.expenseBtn);
      inactive([els.incomeBtn, els.allBtn]);
    });

    els.incomeBtn.addEventListener("click", () => {
      show(els.incomeEl);
      hide([els.expenseEl, els.allEl]);
      active(els.incomeBtn);
      inactive([els.expenseBtn, els.allBtn]);
    });

    els.allBtn.addEventListener("click", () => {
      show(els.allEl);
      hide([els.incomeEl, els.expenseEl]);
      active(els.allBtn);
      inactive([els.incomeBtn, els.expenseBtn]);
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
      els.incomeTitle.value = entry.title;
      els.incomeAmount.value = entry.amount;
    } else if (entry.type === "expense") {
      els.expenseTitle.value = entry.title;
      els.expenseAmount.value = entry.amount;
    }

    deleteEntry(entryLi);
  }

  function updateUI() {
    const config = getConfig();

    if (!els.balanceEl && !cacheElements()) {
      return;
    }

    income = calculateTotal("income", ENTRY_LIST);
    outcome = calculateTotal("expense", ENTRY_LIST);
    balance = calculateBalance(income, outcome);

    const sign = balance >= 0 ? config.CURRENCY_SIGN : `-${config.CURRENCY_SIGN}`;

    els.balanceEl.innerHTML = `<small>${sign}</small>${formatAmount(Math.abs(balance))}`;
    els.outcomeTotalEl.innerHTML = `<small>${config.CURRENCY_SIGN}</small>${formatAmount(outcome)}`;
    els.incomeTotalEl.innerHTML = `<small>${config.CURRENCY_SIGN}</small>${formatAmount(income)}`;

    clearElement([els.expenseList, els.incomeList, els.allList]);

    ENTRY_LIST.forEach((entry, index) => {
      if (entry.type === "expense") {
        showEntry(els.expenseList, entry.type, entry.title, entry.amount, index);
      } else if (entry.type === "income") {
        showEntry(els.incomeList, entry.type, entry.title, entry.amount, index);
      }

      showEntry(els.allList, entry.type, entry.title, entry.amount, index);
    });

    if (typeof root.updateChart === "function") {
      root.updateChart(income, outcome);
    }

    saveEntries();
  }

  function showEntry(list, type, title, amount, id) {
    const doc = getDocument();
    const config = getConfig();

    if (!doc || !list) return;

    const entry = doc.createElement("li");
    entry.id = id;
    entry.className = type;

    const entryText = doc.createElement("div");
    entryText.className = "entry";
    entryText.textContent = `${title} : ${config.CURRENCY_SIGN}${formatAmount(amount)}`;

    const editBtn = doc.createElement("div");
    editBtn.id = EDIT;
    editBtn.title = translate("entry.edit");

    const deleteBtn = doc.createElement("div");
    deleteBtn.id = DELETE;
    deleteBtn.title = translate("entry.delete");

    entry.append(entryText, editBtn, deleteBtn);
    list.prepend(entry);
  }

  function getValidatedEntry(type, titleInput, amountInput) {
    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);

    if (title.length < 2 || title.length > 50) {
      notify(translate("error.titleLength"));
      return null;
    }

    const dangerousPattern = /<script|<\/script>|<.*?>/gi;

    if (dangerousPattern.test(title)) {
      notify(translate("error.invalidTitle"));
      return null;
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
      notify(translate("error.amountRange"));
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
      if (element) {
        element.innerHTML = "";
      }
    });
  }

  function calculateTotal(type, list) {
    return list.reduce(
      (sum, entry) => (entry.type === type ? sum + entry.amount : sum),
      0
    );
  }

  function calculateBalance(incomeValue, outcomeValue) {
    return incomeValue - outcomeValue;
  }

  function formatAmount(amount) {
    return Number(amount).toFixed(2);
  }

  function loadEntries() {
    const config = getConfig();
    const storage = getStorage();

    if (!storage) return [];

    try {
      const rawEntries = storage.getItem(config.STORAGE_KEY);

      if (!rawEntries) return [];

      const parsed = JSON.parse(rawEntries);

      if (!Array.isArray(parsed)) {
        console.warn("Stored data is not an array, resetting.");
        storage.removeItem(config.STORAGE_KEY);
        return [];
      }

      return parsed.filter(isValidEntry).map(normalizeEntry);
    } catch (err) {
      console.error("Failed to load entries:", err);
      storage.removeItem(config.STORAGE_KEY);
      return [];
    }
  }

  function saveEntries() {
    const config = getConfig();
    const storage = getStorage();

    if (!storage) return;

    try {
      storage.setItem(config.STORAGE_KEY, JSON.stringify(ENTRY_LIST));
    } catch (err) {
      console.error("Failed to save entries:", err);
      notify(translate("error.storageSave"));
    }
  }

  function isValidEntry(entry) {
    return Boolean(
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
    const doc = getDocument();
    const config = getConfig();
    const storage = getStorage();

    if (!doc || !storage) return;

    const cookieBanner = doc.getElementById("cookie-banner");
    const acceptBtn = doc.getElementById("accept-cookie");
    const rejectBtn = doc.getElementById("reject-cookie");

    if (!cookieBanner || !acceptBtn || !rejectBtn) return;

    const consent = storage.getItem(config.COOKIE_CONSENT_KEY);

    if (!consent) {
      cookieBanner.classList.remove("hide");
    } else {
      cookieBanner.classList.add("hide");
    }

    acceptBtn.addEventListener("click", () => {
      storage.setItem(config.COOKIE_CONSENT_KEY, "accepted");
      cookieBanner.classList.add("hide");
    });

    rejectBtn.addEventListener("click", () => {
      storage.setItem(config.COOKIE_CONSENT_KEY, "rejected");
      cookieBanner.classList.add("hide");
    });
  }

  function show(element) {
    if (element) {
      element.classList.remove("hide");
    }
  }

  function hide(elements) {
    elements.forEach(el => {
      if (el) {
        el.classList.add("hide");
      }
    });
  }

  function active(element) {
    if (element) {
      element.classList.add("focus");
    }
  }

  function inactive(elements) {
    elements.forEach(el => {
      if (el) {
        el.classList.remove("focus");
      }
    });
  }

  function getEntries() {
    return ENTRY_LIST;
  }

  function setEntries(entries) {
    ENTRY_LIST = Array.isArray(entries) ? entries : [];
    updateUI();
  }

  function getTotals() {
    return {
      income,
      outcome,
      balance
    };
  }

  function autoInitBudget() {
    const doc = getDocument();

    if (!doc) return;

    if (doc.querySelector(".balance .value")) {
      initBudget();
    } else if (typeof doc.addEventListener === "function") {
      doc.addEventListener("DOMContentLoaded", initBudget, { once: true });
    }
  }

  const api = {
    initBudget,
    initTabSwitching,
    initCookieBanner,
    deleteOrEdit,
    deleteEntry,
    editEntry,
    updateUI,
    showEntry,
    getValidatedEntry,
    clearInput,
    clearElement,
    calculateTotal,
    calculateBalance,
    formatAmount,
    loadEntries,
    saveEntries,
    isValidEntry,
    normalizeEntry,
    show,
    hide,
    active,
    inactive,
    getEntries,
    setEntries,
    getTotals
  };

  Object.keys(api).forEach(key => {
    root[key] = api[key];
  });

  autoInitBudget();

  /* istanbul ignore next */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
/* istanbul ignore next */
})(typeof globalThis !== "undefined" ? globalThis : window);
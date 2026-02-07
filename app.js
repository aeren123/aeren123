const storageKey = "household-budget-entries";

const entryForm = document.getElementById("entry-form");
const entryType = document.getElementById("entry-type");
const entryAmount = document.getElementById("entry-amount");
const entryCategory = document.getElementById("entry-category");
const entryDate = document.getElementById("entry-date");
const entryNote = document.getElementById("entry-note");
const entryList = document.getElementById("entry-list");
const totalIncome = document.getElementById("total-income");
const totalExpense = document.getElementById("total-expense");
const balance = document.getElementById("balance");
const filterType = document.getElementById("filter-type");
const searchInput = document.getElementById("search-input");
const exportButton = document.getElementById("export-json");
const clearButton = document.getElementById("clear-all");
const installButton = document.getElementById("install-app");

const formatCurrency = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);

const loadEntries = () => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveEntries = (entries) => {
  localStorage.setItem(storageKey, JSON.stringify(entries));
};

const setDefaultDate = () => {
  const today = new Date();
  const formatted = today.toISOString().slice(0, 10);
  entryDate.value = formatted;
};

const buildEntryElement = (entry) => {
  const item = document.createElement("li");
  item.className = "entry";

  const meta = document.createElement("div");
  meta.className = "meta";

  const title = document.createElement("strong");
  title.textContent = entry.category;

  const details = document.createElement("span");
  details.textContent = `${entry.date} • ${entry.type === "income" ? "Gelir" : "Gider"}`;

  const note = document.createElement("span");
  note.textContent = entry.note ? `Not: ${entry.note}` : "Not yok";

  meta.append(title, details, note);

  const right = document.createElement("div");
  right.className = "actions";

  const amount = document.createElement("div");
  amount.className = `amount ${entry.type}`;
  amount.textContent =
    entry.type === "income"
      ? `+ ${formatCurrency(entry.amount)}`
      : `- ${formatCurrency(entry.amount)}`;

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Sil";
  removeButton.addEventListener("click", () => removeEntry(entry.id));

  right.append(amount, removeButton);
  item.append(meta, right);

  return item;
};

const updateSummary = (entries) => {
  const income = entries
    .filter((entry) => entry.type === "income")
    .reduce((acc, entry) => acc + entry.amount, 0);
  const expense = entries
    .filter((entry) => entry.type === "expense")
    .reduce((acc, entry) => acc + entry.amount, 0);
  const currentBalance = income - expense;

  totalIncome.textContent = formatCurrency(income);
  totalExpense.textContent = formatCurrency(expense);
  balance.textContent = formatCurrency(currentBalance);
};

const renderEntries = () => {
  const entries = loadEntries();
  const searchTerm = searchInput.value.trim().toLowerCase();
  const typeFilter = filterType.value;

  const filtered = entries.filter((entry) => {
    const matchesType = typeFilter === "all" || entry.type === typeFilter;
    const matchesSearch =
      !searchTerm ||
      entry.category.toLowerCase().includes(searchTerm) ||
      (entry.note && entry.note.toLowerCase().includes(searchTerm));
    return matchesType && matchesSearch;
  });

  entryList.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "entry";
    empty.textContent = "Henüz kayıt yok. İlk kaydınızı ekleyin.";
    entryList.appendChild(empty);
  } else {
    filtered
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach((entry) => entryList.appendChild(buildEntryElement(entry)));
  }

  updateSummary(entries);
};

const addEntry = (event) => {
  event.preventDefault();

  const amountValue = Number(entryAmount.value);
  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    return;
  }

  const entries = loadEntries();
  const newEntry = {
    id: crypto.randomUUID(),
    type: entryType.value,
    amount: amountValue,
    category: entryCategory.value.trim(),
    date: entryDate.value,
    note: entryNote.value.trim(),
  };

  entries.push(newEntry);
  saveEntries(entries);
  entryForm.reset();
  setDefaultDate();
  renderEntries();
};

const removeEntry = (id) => {
  const entries = loadEntries();
  const nextEntries = entries.filter((entry) => entry.id !== id);
  saveEntries(nextEntries);
  renderEntries();
};

const exportEntries = () => {
  const entries = loadEntries();
  const blob = new Blob([JSON.stringify(entries, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ev-butce-kayitlari.json";
  link.click();
  URL.revokeObjectURL(url);
};

const clearEntries = () => {
  const confirmed = window.confirm(
    "Tüm kayıtlar silinecek. Devam etmek istiyor musunuz?"
  );
  if (!confirmed) return;

  saveEntries([]);
  renderEntries();
};

entryForm.addEventListener("submit", addEntry);
filterType.addEventListener("change", renderEntries);
searchInput.addEventListener("input", renderEntries);
exportButton.addEventListener("click", exportEntries);
clearButton.addEventListener("click", clearEntries);

setDefaultDate();
renderEntries();

let deferredInstallPrompt = null;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButton.hidden = true;
});

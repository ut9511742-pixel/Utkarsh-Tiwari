const STORAGE_KEY = "medicine-table-data";

const form = document.getElementById("medicine-form");
const submitBtn = document.getElementById("submit-btn");
const searchInput = document.getElementById("search");
const exportBtn = document.getElementById("export-btn");
const clearBtn = document.getElementById("clear-btn");
const tableBody = document.getElementById("table-body");
const emptyState = document.getElementById("empty-state");

let medicines = loadMedicines();
let editingId = null;

renderTable();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const medicine = getFormData();
  if (!medicine.name || !medicine.dosage || !medicine.frequency) return;

  if (editingId) {
    medicines = medicines.map((item) =>
      item.id === editingId ? { ...item, ...medicine } : item
    );
    editingId = null;
    submitBtn.textContent = "Add to Table";
  } else {
    medicines.push({ id: crypto.randomUUID(), ...medicine });
  }

  saveMedicines();
  renderTable(searchInput.value);
  form.reset();
});

searchInput.addEventListener("input", () => {
  renderTable(searchInput.value);
});

exportBtn.addEventListener("click", () => {
  if (!medicines.length) return;
  const headers = [
    "Name",
    "Dosage",
    "Frequency",
    "Time",
    "Start Date",
    "Notes",
  ];

  const rows = medicines.map((m) =>
    [m.name, m.dosage, m.frequency, m.time, m.startDate, m.notes]
      .map((value) => `"${(value || "").replaceAll('"', '""')}"`)
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "medicine-table.csv";
  a.click();

  URL.revokeObjectURL(url);
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Delete all medicines?")) return;
  medicines = [];
  editingId = null;
  form.reset();
  submitBtn.textContent = "Add to Table";
  saveMedicines();
  renderTable();
});

function getFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    dosage: document.getElementById("dosage").value.trim(),
    frequency: document.getElementById("frequency").value.trim(),
    time: document.getElementById("time").value.trim(),
    startDate: document.getElementById("start-date").value,
    notes: document.getElementById("notes").value.trim(),
  };
}

function renderTable(searchText = "") {
  const filter = searchText.trim().toLowerCase();
  const filtered = medicines.filter((m) => {
    const text = `${m.name} ${m.dosage} ${m.frequency} ${m.time} ${m.startDate} ${m.notes}`.toLowerCase();
    return text.includes(filter);
  });

  tableBody.innerHTML = "";

  filtered.forEach((medicine, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(medicine.name)}</td>
      <td>${escapeHtml(medicine.dosage)}</td>
      <td>${escapeHtml(medicine.frequency)}</td>
      <td>${escapeHtml(medicine.time)}</td>
      <td>${escapeHtml(medicine.startDate)}</td>
      <td>${escapeHtml(medicine.notes)}</td>
      <td>
        <div class="row-actions">
          <button type="button" data-edit="${medicine.id}">Edit</button>
          <button type="button" class="danger" data-delete="${medicine.id}">Delete</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  tableBody.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => startEdit(btn.dataset.edit));
  });

  tableBody.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => deleteMedicine(btn.dataset.delete));
  });

  emptyState.style.display = filtered.length ? "none" : "block";
}

function startEdit(id) {
  const target = medicines.find((m) => m.id === id);
  if (!target) return;

  editingId = id;
  document.getElementById("name").value = target.name;
  document.getElementById("dosage").value = target.dosage;
  document.getElementById("frequency").value = target.frequency;
  document.getElementById("time").value = target.time;
  document.getElementById("start-date").value = target.startDate;
  document.getElementById("notes").value = target.notes;

  submitBtn.textContent = "Update Medicine";
}

function deleteMedicine(id) {
  medicines = medicines.filter((m) => m.id !== id);
  saveMedicines();
  renderTable(searchInput.value);
}

function saveMedicines() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
}

function loadMedicines() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

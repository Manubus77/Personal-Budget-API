const API_BASE = "/envelopes"; // adjust if backend URL changes

// Cache DOM elements
const envelopesContainer = document.getElementById("envelopes-container");
const totalBudgetInput = document.getElementById("total-budget");
const setTotalBudgetForm = document.getElementById("set-total-budget-form");

const createForm = document.getElementById("create-envelope-form");
const updateForm = document.getElementById("update-envelope-form");
const deleteForm = document.getElementById("delete-envelope-form");
const transferForm = document.getElementById("transfer-budget-form");

const featureButtonsDiv = document.getElementById("feature-buttons");
const featureFormsDiv = document.getElementById("feature-forms");

let totalBudget = null; // Initially no budget set

// Utility to display envelopes
async function loadEnvelopes() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to load envelopes");
    const envelopes = await res.json();

    envelopesContainer.innerHTML = "";

    if (envelopes.length === 0) {
      envelopesContainer.textContent = "No envelopes yet.";
      return;
    }

    envelopes.forEach(({ id, category, budget, balance }) => {
      const div = document.createElement("div");
      div.classList.add("envelope");
      div.innerHTML = `
        <strong>ID: ${id}</strong> - <em>${category}</em><br>
        Budget: ${budget} | Balance: ${balance}
      `;
      envelopesContainer.appendChild(div);
    });
  } catch (err) {
    envelopesContainer.textContent = `Error loading envelopes: ${err.message}`;
  }
}

// Show message helper (for now, alert)
function showMessage(msg) {
  alert(msg);
}

// Hide all feature forms
function hideAllFeatureForms() {
  [createForm, updateForm, deleteForm, transferForm].forEach((form) => {
    form.style.display = "none";
  });
}

// Show feature buttons and forms container after budget is set
function enableFeatures() {
  featureButtonsDiv.style.display = "block";
  featureFormsDiv.style.display = "block";
}

// Event listener for feature buttons to toggle corresponding forms
featureButtonsDiv.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;

  const targetFormId = e.target.getAttribute("data-target");
  if (!targetFormId) return;

  const targetForm = document.getElementById(targetFormId);

  if (targetForm.style.display === "block") {
    // If already visible, hide it
    targetForm.style.display = "none";
  } else {
    // Hide others and show the selected form
    hideAllFeatureForms();
    targetForm.style.display = "block";
  }
});

// Set Total Budget Form submit
setTotalBudgetForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = Number(totalBudgetInput.value);
  if (!val || val <= 0) {
    showMessage("Total budget must be a positive number.");
    return;
  }
  totalBudget = val;
  showMessage(
    `Total budget set to ${totalBudget}. Note: Backend support not yet implemented.`
  );

  // Disable budget input and submit button after setting budget
  totalBudgetInput.disabled = true;
  setTotalBudgetForm.querySelector("button").disabled = true;

  // Enable features UI
  enableFeatures();
});

// Create Envelope Form submit
createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const category = e.target.category.value.trim();
  const budget = Number(e.target.budget.value);

  if (!category) {
    showMessage("Category cannot be empty.");
    return;
  }
  if (isNaN(budget) || budget <= 0) {
    showMessage("Budget must be a positive number.");
    return;
  }

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, budget }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create envelope.");

    showMessage(`Envelope created: ID ${data.id} (${data.category})`);
    e.target.reset();
    loadEnvelopes();
  } catch (err) {
    showMessage(err.message);
  }
});

// Update Envelope Form submit
updateForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = Number(e.target["update-id"].value);
  if (!id || id <= 0) {
    showMessage("Valid envelope ID is required.");
    return;
  }

  const body = {};
  const category = e.target["update-category"].value.trim();
  const budgetVal = e.target["update-budget"].value;
  const balanceVal = e.target["update-balance"].value;

  if (category) body.category = category;
  if (budgetVal !== "") {
    const budget = Number(budgetVal);
    if (isNaN(budget) || budget <= 0) {
      showMessage("Budget must be a positive number.");
      return;
    }
    body.budget = budget;
  }
  if (balanceVal !== "") {
    const balance = Number(balanceVal);
    if (isNaN(balance) || balance < 0) {
      showMessage("Balance must be zero or a positive number.");
      return;
    }
    body.balance = balance;
  }

  if (Object.keys(body).length === 0) {
    showMessage("Please provide at least one field to update.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update envelope.");

    showMessage(`Envelope ID ${data.id} updated.`);
    e.target.reset();
    loadEnvelopes();
  } catch (err) {
    showMessage(err.message);
  }
});

// Delete Envelope Form submit
deleteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = Number(e.target["delete-id"].value);
  if (!id || id <= 0) {
    showMessage("Valid envelope ID is required.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    if (res.status === 204) {
      showMessage(`Envelope ID ${id} deleted.`);
      e.target.reset();
      loadEnvelopes();
    } else {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete envelope.");
    }
  } catch (err) {
    showMessage(err.message);
  }
});

// Transfer Budget Form submit
transferForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fromId = Number(e.target["from-id"].value);
  const toId = Number(e.target["to-id"].value);
  const amount = Number(e.target["amount"].value);

  if (!fromId || fromId <= 0 || !toId || toId <= 0) {
    showMessage(
      "Both source and destination envelope IDs must be positive numbers."
    );
    return;
  }
  if (fromId === toId) {
    showMessage("Source and destination envelopes cannot be the same.");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    showMessage("Transfer amount must be a positive number.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromEnvelopeId: fromId,
        toEnvelopeId: toId,
        amount,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to transfer budget.");

    showMessage(`Transferred ${amount} from envelope ${fromId} to ${toId}.`);
    e.target.reset();
    loadEnvelopes();
  } catch (err) {
    showMessage(err.message);
  }
});

// Load envelopes on page load
window.addEventListener("DOMContentLoaded", () => {
  loadEnvelopes();

  // Initially hide feature buttons and forms (should already be hidden by CSS)
  featureButtonsDiv.style.display = "none";
  featureFormsDiv.style.display = "none";

  hideAllFeatureForms();
});

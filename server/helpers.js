const envelopesList = [];
let totalBudget = 2000;

// Create a new evelope
const createEnv = (newCategory, newBudget) => {
  if (typeof newBudget !== "number" || newBudget <= 0) {
    throw new Error("Budget must be a positive number.");
  }

  const cleanCategory = newCategory.trim();

  // Check for duplicate category (case-insensitive)
  const categoryExists = envelopesList.some(
    (env) => env.category.toLowerCase() === cleanCategory.toLowerCase()
  );
  if (categoryExists) {
    throw new Error(`Category '${newCategory}' already exists.`);
  }

  // Check if total budget would be exceeded
  const usedBudget = getUsedBudget();
  if (usedBudget + newBudget > totalBudget) {
    throw new Error(
      `Creating this envelope would exceed the total budget of ${totalBudget}.`
    );
  }

  // Generate new ID
  const newId =
    envelopesList.length === 0
      ? 1
      : envelopesList[envelopesList.length - 1].id + 1;

  const newEnv = {
    id: newId,
    category: cleanCategory,
    budget: newBudget,
    balance: newBudget,
  };

  envelopesList.push(newEnv);
  return newEnv;
};

//Compute used budget
const getUsedBudget = () =>
  envelopesList.reduce((acc, env) => acc + env.budget, 0);

//Available Budget
const getTotalAvailableBudget = () =>
  envelopesList.reduce((acc, env) => acc + env.balance, 0);

// Check if envelope ID exists
const getEnvelopeById = (id) => {
  const found = envelopesList.find((env) => env.id === id);
  if (!found) {
    throw new Error(`Envelope with ID ${id} not found`);
  }
  return found;
};

// Update envelope by ID
const updateEnvelopeById = (id, newData) => {
  const envelope = getEnvelopeById(id); // throws if not found

  // Validate category uniqueness (case-insensitive)
  if (newData.category !== undefined) {
    const cleanCategory = newData.category.trim();
    const newCategory = cleanCategory.toLowerCase();

    const categoryExists = envelopesList.some(
      (env) => env.id !== id && env.category.toLowerCase() === newCategory
    );
    if (categoryExists) {
      throw new Error(`Category '${newData.category}' already exists.`);
    }
    envelope.category = cleanCategory;
  }

  // Validate budget update if provided
  if (typeof newData.budget === "number") {
    if (newData.budget <= 0) {
      throw new Error("Budget must be a positive number.");
    }

    // Calculate total budget of all other envelopes
    const totalOtherBudgets = envelopesList
      .filter((env) => env.id !== id)
      .reduce((acc, env) => acc + env.budget, 0);

    // Check if new total would exceed global budget
    const proposedTotal = totalOtherBudgets + newData.budget;
    if (proposedTotal > totalBudget) {
      throw new Error(
        `Updating this envelope would exceed the total budget limit of ${totalBudget}.`
      );
    }

    // Ensure budget >= current balance (no shrinking below unspent funds)
    if (newData.budget < envelope.balance) {
      throw new Error(
        `Budget cannot be less than current balance (${envelope.balance}).`
      );
    }

    // Adjust balance if budget increased
    const diff = newData.budget - envelope.budget;
    if (diff > 0) {
      envelope.balance += diff;
    }

    envelope.budget = newData.budget;
  }

  return envelope;
};

module.exports = {
  totalBudget,
  envelopesList,
  getUsedBudget,
  getTotalAvailableBudget,
  createEnv,
  getEnvelopeById,
  updateEnvelopeById,
};

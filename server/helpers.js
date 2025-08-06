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
  const envelope = getEnvelopeById(id); // throws error if not found

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

    const diff = newData.budget - envelope.budget;

    if (diff > 0) {
      // Budget increased: add difference to balance
      envelope.balance += diff;
    } else if (diff < 0) {
      // Budget decreased
      const decreaseAmount = Math.abs(diff);

      if (envelope.balance === 0) {
        throw new Error(
          "Cannot reduce budget because envelope balance is zero (fully spent)."
        );
      }

      if (envelope.balance >= decreaseAmount) {
        envelope.balance -= decreaseAmount;
      } else {
        throw new Error(
          `Cannot reduce budget by ${decreaseAmount} because current balance is only ${envelope.balance}.`
        );
      }
    }

    envelope.budget = newData.budget;
  }

  // Update balance (set new available balance)
  if (typeof newData.balance === "number") {
    if (newData.balance < 0) {
      throw new Error("Balance cannot be negative.");
    }

    if (newData.balance > envelope.budget) {
      throw new Error(`Balance cannot exceed the budget (${envelope.budget}).`);
    }

    envelope.balance = newData.balance;
  }

  return envelope;
};

//Delete envelope by ID
const deleteEnvelopeById = (id) => {
  const index = envelopesList.findIndex((env) => env.id === id);
  if (index !== -1) {
    envelopesList.splice(index, 1);
    return true; // Successfully deleted
  }
  return false;
};

//TRANSFER budget from one envelope to another
const transferBudget = (fromId, toId, amount) => {
  // Get envelopes
  const fromEnv = getEnvelopeById(fromId);
  const toEnv = getEnvelopeById(toId);

  // Validate amount
  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Transfer amount must be a positive number.");
  }

  // Check balance in source
  if (fromEnv.balance < amount) {
    throw new Error("Insufficient balance in source envelope.");
  }

  // Perform transfer
  fromEnv.balance -= amount;
  toEnv.balance += amount;

  return { fromEnv, toEnv };
};

module.exports = {
  totalBudget,
  envelopesList,
  getUsedBudget,
  getTotalAvailableBudget,
  createEnv,
  getEnvelopeById,
  updateEnvelopeById,
  deleteEnvelopeById,
  transferBudget,
};

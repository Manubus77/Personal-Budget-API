const envelopesList = [];
let budget = 0;

// Create a new evelope
const createEnv = (NewCategory, NewBudget, NewRemainingBudget) => {
  let newId;

  if (envelopesList.length === 0) {
    newId = 1;
  } else {
    newId = envelopesList[envelopesList.length - 1].id + 1;
  }

  const newEnv = {
    id: newId,
    category: NewCategory,
    budget: NewBudget,
    remainingBudget: NewRemainingBudget,
  };

  envelopesList.push(newEnv);
  return newEnv;
};

// Check if envelope ID exists
const getEnvelopeById = (id) => {
  const found = envelopesList.find((env) => env.id === id);
  if (!found) {
    throw new Error(`Envelope with ID ${id} not found`);
  }
  return found;
};

module.exports = { envelopesList, createEnv, getEnvelopeById };

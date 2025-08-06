const express = require("express");
const envelopeRouter = express.Router();
const {
  envelopesList,
  createEnv,
  getEnvelopeById,
  updateEnvelopeById,
  deleteEnvelopeById,
  transferBudget,
} = require("./helpers.js");

//Middleware for checking if the request body is valid
const validateCreateEnvelopeBody = (req, res, next) => {
  const { category, budget } = req.body;

  if (typeof category !== "string" || !category.trim()) {
    return res
      .status(400)
      .send({ error: 'Request must include a non-empty "category" string.' });
  }

  if (typeof budget !== "number" || budget <= 0) {
    return res
      .status(400)
      .send({ error: '"budget" must be a positive number.' });
  }

  next();
};

// Middleware to check if updated fields are valid
const validateUpdateEnvelopeBody = (req, res, next) => {
  const { category, budget, balance } = req.body;

  if (category !== undefined) {
    if (typeof category !== "string" || !category.trim()) {
      return res
        .status(400)
        .send({ error: 'If provided, "category" must be a non-empty string.' });
    }
  }

  if (budget !== undefined) {
    if (typeof budget !== "number" || budget <= 0) {
      return res
        .status(400)
        .send({ error: '"budget", if provided, must be a positive number.' });
    }
  }

  if (balance !== undefined) {
    if (typeof balance !== "number" || balance < 0) {
      return res.status(400).send({
        error: '"balance", if provided, must be zero or a positive number.',
      });
    }
  }

  next();
};

// Middleware  to validate ID and ensure envelope exists. Attach it to the req object as req.envelopeId
const validateEnvelopeId = (req, res, next) => {
  const id = Number(req.params.envelopeId);

  if (Number.isNaN(id) || id <= 0) {
    return res
      .status(400)
      .send({ error: "Invalid envelope ID. It must be a positive number." });
  }

  try {
    const envelope = getEnvelopeById(id);
    req.envelopeId = id;
    req.envelope = envelope; // Optional: useful for downstream handlers
    next();
  } catch (err) {
    return res.status(404).send({ error: err.message });
  }
};

// Middleware to validate fromEnvelopeId and toEnvelopeId in req.body
const validateTransferIds = (req, res, next) => {
  const { fromEnvelopeId, toEnvelopeId, amount } = req.body;

  if (
    typeof fromEnvelopeId !== "number" ||
    fromEnvelopeId <= 0 ||
    typeof toEnvelopeId !== "number" ||
    toEnvelopeId <= 0
  ) {
    return res.status(400).send({
      error: '"fromEnvelopeId" and "toEnvelopeId" must be positive numbers.',
    });
  }

  if (fromEnvelopeId === toEnvelopeId) {
    return res.status(400).send({
      error: '"fromEnvelopeId" and "toEnvelopeId" cannot be the same.',
    });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res
      .status(400)
      .send({ error: '"amount" must be a positive number.' });
  }

  next();
};

//POST a new envelope
envelopeRouter.post("/", validateCreateEnvelopeBody, (req, res, next) => {
  const { category, budget } = req.body;

  try {
    const newEnvelope = createEnv(category, budget);
    res.status(201).send(newEnvelope);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//GET all envelopes
envelopeRouter.get("/", (req, res, next) => {
  res.status(200).send(envelopesList);
});

//GET specific envelope by ID
envelopeRouter.get("/:envelopeId", validateEnvelopeId, (req, res, next) => {
  res.status(200).send(req.envelope);
});

//PUT an envelope by ID
envelopeRouter.put(
  "/:envelopeId",
  validateEnvelopeId,
  validateUpdateEnvelopeBody,
  (req, res, next) => {
    try {
      const updated = updateEnvelopeById(req.envelopeId, req.body);
      res.status(200).send(updated);
    } catch (err) {
      if (err.message.includes("not found")) {
        res.status(404).send({ error: err.message });
      } else {
        res.status(400).send({ error: err.message });
      }
    }
  }
);

//DELETE specific envelope by ID
envelopeRouter.delete("/:envelopeId", validateEnvelopeId, (req, res, next) => {
  const deleted = deleteEnvelopeById(req.envelopeId);

  if (deleted) {
    res.status(204).send();
  } else {
    res.status(500).send({ error: "Failed to delete" });
  }
});

//POST for transfering balance from one envelope to another
envelopeRouter.post("/transfer", validateTransferIds, (req, res, next) => {
  try {
    const { fromEnvelopeId, toEnvelopeId, amount } = req.body;
    const transferred = transferBudget(fromEnvelopeId, toEnvelopeId, amount);
    res.status(201).send(transferred);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

//MODULE EXPORTS
module.exports = envelopeRouter;

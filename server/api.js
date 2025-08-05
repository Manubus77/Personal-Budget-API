const express = require("express");
const envelopeRouter = express.Router();
const {
  envelopesList,
  createEnv,
  getEnvelopeById,
  updateEnvelopeById,
} = require("./helpers.js");

//Middleware for checking if the request body is valid
const validateEnvelopeBody = (req, res, next) => {
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

// Middleware to validate envelopeId param
const validateEnvelopeIdParam = (req, res, next) => {
  const id = Number(req.params.envelopeId);

  if (Number.isNaN(id) || id <= 0) {
    return res
      .status(400)
      .send({ error: "Invalid envelope ID. It must be a positive number." });
  }

  // Attach the numeric id to the request object for downstream use
  req.envelopeId = id;

  next();
};

//POST a new envelope
envelopeRouter.post("/", validateEnvelopeBody, (req, res, next) => {
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
envelopeRouter.get(
  "/:envelopeId",
  validateEnvelopeIdParam,
  (req, res, next) => {
    try {
      const foundEnv = getEnvelopeById(req.envelopeId);
      res.status(200).send(foundEnv);
    } catch (err) {
      res.status(404).send({ error: err.message });
    }
  }
);

//PUT an envelope by ID
envelopeRouter.put(
  "/:envelopeId",
  validateEnvelopeIdParam,
  validateEnvelopeBody,
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

//MODULE EXPORTS
module.exports = envelopeRouter;

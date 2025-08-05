const express = require("express");
const envelopeRouter = express.Router();
const { envelopesList, createEnv, getEnvelopeById } = require("./helpers.js");

//POST a new envelope
envelopeRouter.post("/", (req, res, next) => {
  const { category, budget, remainingBudget } = req.body;
  const newEnvelope = createEnv(category, budget, remainingBudget);
  res.status(201).send(newEnvelope);
});

//GET all envelopes
envelopeRouter.get("/", (req, res, next) => {
  res.status(200).send(envelopesList);
});

//GET specific envelope by ID
envelopeRouter.get("/:envelopeId", (req, res, next) => {
  const id = Number(req.params.envelopeId); // Convert from string to number
  try {
    const foundEnv = getEnvelopeById(id);
    res.status(200).send(foundEnv);
  } catch (err) {
    res.status(404).send({ error: err.message });
  }
});

//MODULE EXPORTS
module.exports = envelopeRouter;

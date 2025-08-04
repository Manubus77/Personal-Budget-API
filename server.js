const express = require("express");
const app = express();
const PORT = process.env.PORT || 4001;

// Middleware to parse JSON
app.use(express.json());

// Basic route to test the server
app.get("/", (req, res) => {
  res.send("Personal Budget API is running!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

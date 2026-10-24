require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`NexaHealth Backend running on http://localhost:${PORT}`);
});

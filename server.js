const express = require("express");
const schoolRoutes = require("./routes/schoolRoutes");
const { initDb } = require("./config/db");  

const app = express();
app.use(express.json());
app.use("/api", schoolRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to School Management");
});

const PORT = process.env.PORT || 3000;


(async () => {
  await initDb();   
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
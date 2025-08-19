const express = require("express");
const schoolRoutes = require("./routes/schoolRoutes");
const db = require("./config/db"); // this runs init automatically

const app = express();
app.use(express.json());
app.use("/api", schoolRoutes);

app.get("/",(req,res)=>{
    res.send("Welcome to school Management")
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

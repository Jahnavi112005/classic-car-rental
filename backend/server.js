const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const carRoutes = require("./routes/carRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Classic Car Rental Backend Running",
  });
});

app.use("/api/cars", carRoutes);

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
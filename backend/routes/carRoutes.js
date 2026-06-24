const express = require("express");
const router = express.Router();

const { getAllCars } = require("../controllers/carController");

router.get("/", getAllCars);

module.exports = router;
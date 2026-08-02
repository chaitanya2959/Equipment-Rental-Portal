const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { createTicket, getMyTickets } = require("../controllers/support.controller");

router.post("/", protect, createTicket);
router.get("/", protect, getMyTickets);

module.exports = router;

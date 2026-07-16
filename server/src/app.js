const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const equipmentRoutes = require("./routes/equipment.routes");
const bookingRoutes=require("./routes/booking.routes");



const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/equipment", equipmentRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Equipment Rental Portal API"
    });
});

module.exports = app;
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const equipmentRoutes = require("./routes/equipment.routes");
const bookingRoutes=require("./routes/booking.routes");
const notificationRoutes = require("./routes/notification.routes");
const reviewRoutes = require("./routes/review.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const adminRoutes=require("./routes/admin.routes");
const categoryRoutes=require("./routes/category.routes");
const supportRoutes = require("./routes/support.routes");



const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/equipment", equipmentRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/support", supportRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "Equipment Rental Portal API"
    });
});

module.exports = app;

const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");
const authorize = require("../middleware/role");
const upload = require("../middleware/upload");

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

// Admin: Create Category
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("image", 1),
  createCategory
);

// Get All Categories (public for browsing, with search and pagination)
router.get("/", getAllCategories);

// Admin: Get Single Category
router.get("/:id", protect, authorize("admin"), getCategoryById);

// Admin: Update Category
router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.array("image", 1),
  updateCategory
);

// Admin: Delete Category
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;

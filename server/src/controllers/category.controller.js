const Category = require("../models/Category");
const Equipment = require("../models/Equipment");

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim("-");
};

// Create Category
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: generateSlug(name) }],
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    let image = "";
    if (req.files && req.files.length > 0) {
      image = req.files[0].filename;
    }

    const category = await Category.create({
      name: name.trim(),
      slug: generateSlug(name),
      description: description || "",
      icon: icon || "",
      image,
      status: status || "Active",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Categories with search, pagination, and equipment count
const getAllCategories = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (status) {
      filter.status = status;
    }

    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments(filter);

    // Update equipment count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const equipmentCount = await Equipment.countDocuments({
          category: category.name,
        });

        // Update the equipmentCount field
        if (category.equipmentCount !== equipmentCount) {
          category.equipmentCount = equipmentCount;
          await category.save();
        }

        return {
          ...category.toObject(),
          equipmentCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: categoriesWithCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Category
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const equipmentCount = await Equipment.countDocuments({
      category: category.name,
    });

    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        equipmentCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const { name, description, icon, status } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name && name.trim() && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category name already exists",
        });
      }

      category.name = name.trim();
      category.slug = generateSlug(name);
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (icon !== undefined) {
      category.icon = icon;
    }

    if (status !== undefined) {
      category.status = status;
    }

    if (req.files && req.files.length > 0) {
      category.image = req.files[0].filename;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

const Equipment = require("../models/Equipment");

// Get All Equipment
const getAllEquipment = async (req, res) => {
    try {

        const equipments = await Equipment.find();

        res.status(200).json({
            success: true,
            count: equipments.length,
            data: equipments
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

//add Equipment
const addEquipment = async (req, res) => {
    try {

        const images = req.files
            ? req.files.map(file => file.filename)
            : [];

        const equipment = await Equipment.create({
            ...req.body,
            owner: req.user.id,
            images
        });

        res.status(201).json({
            success: true,
            message: "Equipment Added Successfully",
            data: equipment
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
// Delete Equipment
const deleteEquipment = async (req, res) => {
    try {

        const equipment = await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment Not Found"
            });
        }

        // Owner and Admin can Delete the equipment
        if (
            equipment.owner.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        await Equipment.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Equipment Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
// update equipment
const updateEquipment = async (req, res) => {
    try {

        const equipment = await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment Not Found"
            });
        }

        // Owner and Admin can update the equipment
        if (
            equipment.owner.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Access Denied"
            });
        }

        let updateData = { ...req.body };

        // Handle images: if new files uploaded, replace images
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => file.filename);
        } else if (req.body.keepImages === "true") {
            // Keep existing images when no new files uploaded
            updateData.images = equipment.images || [];
        }

        // Handle boolean conversion for available
        if (req.body.available === "true") updateData.available = true;
        if (req.body.available === "false") updateData.available = false;

        const updatedEquipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Equipment Updated Successfully",
            data: updatedEquipment
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
//get Equipment By ID
const getEquipmentById = async (req, res) => {
    try {

        const equipment = await Equipment.findById(req.params.id);

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment Not Found"
            });
        }

        res.status(200).json({
            success: true,
            data: equipment
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
// Search Equipment
const searchEquipment = async (req, res) => {
    try {
        const { name } = req.query;

        const result = await Equipment.find({
            name: { $regex: name, $options: "i" }
        });

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// Filter By Category
const filterByCategory = async (req, res) => {
    try {
        const { category } = req.query;

        const result = await Equipment.find({
            category: category
        });

        res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const sortEquipment = async (req, res) => {
    try {
        const { order } = req.query;

        let sortOption = {};

        if (order === "asc") {
            sortOption.pricePerDay = 1;
        } else if (order === "desc") {
            sortOption.pricePerDay = -1;
        }

        const equipments = await Equipment.find().sort(sortOption);

        res.status(200).json({
            success: true,
            count: equipments.length,
            data: equipments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
const getPaginatedEquipment = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const skip = (page - 1) * limit;

        const equipments = await Equipment.find()
            .skip(skip)
            .limit(limit);

        const total = await Equipment.countDocuments();

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: equipments
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
const getMyEquipment = async (req, res) => {
    try {

        const equipments = await Equipment.find({
            owner: req.user.id
        });

        res.status(200).json({
            success: true,
            count: equipments.length,
            data: equipments
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getAllEquipment,
    addEquipment,
    deleteEquipment,
    updateEquipment,
    getEquipmentById,
    searchEquipment,
    filterByCategory,
    sortEquipment,
    getPaginatedEquipment,
    getMyEquipment
};
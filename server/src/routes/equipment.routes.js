const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");

const {
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
} = require("../controllers/equipment.controller");

const {
    equipmentValidation
} = require("../validations/equipment.validation");


router.post(
    "/",
    protect,
    authorize("owner", "admin"),
    upload.array("images", 5),
    equipmentValidation,
    validate,
    addEquipment
);


router.get(
    "/my-equipment",
    protect,
    authorize("owner"),
    getMyEquipment
);

router.put(
    "/:id",
    protect,
    authorize("owner", "admin"),
    upload.array("images", 5),
    equipmentValidation,
    validate,
    updateEquipment
);

router.delete(
    "/:id",
    protect,
    authorize("owner", "admin"),
    deleteEquipment
);
router.get("/", getAllEquipment);

router.get("/my-equipment", protect, authorize("owner"), getMyEquipment);

router.get("/search", searchEquipment);

router.get("/filter/category", filterByCategory);

router.get("/sort/price", sortEquipment);

router.get("/pagination/list", getPaginatedEquipment);

router.get("/:id", getEquipmentById);
 
module.exports = router;
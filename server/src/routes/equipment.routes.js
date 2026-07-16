const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const authorize = require("../middleware/role");
const upload = require("../middleware/upload");

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

router.post(
    "/",
    protect,
    authorize("owner", "admin"),
    upload.single("image"),
    addEquipment
);
router.get("/", getAllEquipment);

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
    updateEquipment
);

router.delete(
    "/:id",
    protect,
    authorize("owner", "admin"),
    deleteEquipment
);

router.get("/search", searchEquipment);

router.get("/filter/category", filterByCategory);

router.get("/:id", getEquipmentById);

router.get("/sort/price", sortEquipment);

router.get("/pagination/list", getPaginatedEquipment);
 
module.exports = router;
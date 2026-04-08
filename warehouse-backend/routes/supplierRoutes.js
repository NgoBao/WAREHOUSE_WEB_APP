const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { getAll, getOne, create, update, remove } = require("../controllers/supplierController");

router.use(auth);

// Read access: staff + admin
router.get("/", role("admin", "staff"), getAll);
router.get("/:id", role("admin", "staff"), getOne);

// Write access: admin only (master data governance)
router.post("/", role("admin"), create);
router.put("/:id", role("admin"), update);
router.delete("/:id", role("admin"), remove);

module.exports = router;
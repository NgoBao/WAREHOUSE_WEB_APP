const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { getAll, getOne, create, update, remove } = require("../controllers/customerController");

router.use(auth);

// Read access: staff + admin
router.get("/", role("admin", "staff"), getAll);
router.get("/:id", role("admin", "staff"), getOne);

// Write access: staff + admin (operational need)
router.post("/", role("admin", "staff"), create);
router.put("/:id", role("admin", "staff"), update);

// Deleting customers is high-risk; keep admin-only (soft delete in model)
router.delete("/:id", role("admin"), remove);

module.exports = router;
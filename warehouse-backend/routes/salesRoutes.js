const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { create, complete, list, detail } = require("../controllers/salesController");

router.use(auth);

// Operational workflow: staff + admin
router.get("/", role("admin", "staff"), list);
router.get("/:id", role("admin", "staff"), detail);
router.post("/", role("admin", "staff"), create);
router.put("/:id/complete", role("admin", "staff"), complete);

module.exports = router;
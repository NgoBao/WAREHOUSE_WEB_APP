const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { create, receive, list, detail } = require("../controllers/purchaseController");

router.use(auth);

router.get("/", list);
router.get("/:id", detail);
router.post("/", create);

// receiving stock: admin only (common in classes)
router.put("/:id/receive", role("admin"), receive);

module.exports = router;
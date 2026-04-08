const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { create, receive, list, detail } = require("../controllers/purchaseController");

router.use(auth);

// Operational workflow: staff + admin
router.get("/", role("admin", "staff"), list);
router.get("/:id", role("admin", "staff"), detail);
router.post("/", role("admin", "staff"), create);

// Receiving stock is a warehouse action; allow staff + admin
router.put("/:id/receive", role("admin", "staff"), receive);

module.exports = router;
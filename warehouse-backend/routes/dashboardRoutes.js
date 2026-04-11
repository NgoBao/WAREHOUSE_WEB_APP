const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { summary, staffSummary } = require("../controllers/dashboardController");

router.get("/summary", auth, role("admin"), summary);
router.get("/staff-summary", auth, role("admin", "staff"), staffSummary);

module.exports = router;
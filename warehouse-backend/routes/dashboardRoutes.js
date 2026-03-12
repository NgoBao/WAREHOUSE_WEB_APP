const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { summary } = require("../controllers/dashboardController");

router.get("/summary", auth, role("admin"), summary);

module.exports = router;
const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { create, complete, list, detail } = require("../controllers/salesController");

router.use(auth);

router.get("/", list);
router.get("/:id", detail);
router.post("/", create);
router.put("/:id/complete", complete);

module.exports = router;
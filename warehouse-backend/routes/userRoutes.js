const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const { getAll, getOne, setRole, remove } = require("../controllers/userController");

router.use(auth, role("admin"));

router.get("/", getAll);
router.get("/:id", getOne);
router.put("/:id/role", setRole);
router.delete("/:id", remove);

module.exports = router;
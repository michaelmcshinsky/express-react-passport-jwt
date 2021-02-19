const router = require("express").Router();
const authRoutes = require("./auth");
const usersRoutes = require("./users");

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);

module.exports = router;

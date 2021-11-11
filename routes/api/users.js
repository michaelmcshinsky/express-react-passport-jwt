const router = require("express").Router();
const passport = require("passport");
const { User } = require("../../app/models");
const { getToken, decode } = require("../../app/services/token");
const { withAuth } = require('../../app/middleware/auth')
const usersController = require("../../app/controllers/usersController");

router.get(
  "/profile",
  withAuth,
  function (req, res) {
    try {
      var token = decode(getToken(req.headers));
      if (token) {
        User.findById(token.id, {password: 0}, function (err, user) {
          return res.json(user);
        });
      } else {
        return res.status(403).send({ success: false, msg: "Unauthorized." });
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  }
);

router
  .route("/")
  .get(
    withAuth,
    usersController.findAll
  )
  .post(
    withAuth,
    usersController.create
  );

router
  .route("/:id")
  .get(
    withAuth,
    usersController.findById
  )
  .put(withAuth, usersController.update)
  .delete(
    withAuth,
    usersController.remove
  );

module.exports = router;

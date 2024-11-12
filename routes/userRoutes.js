const express = require("express");
const userController = require("../controllers/userController");
const authenicatedUser = require("../middleware/authmiddileware"); //jwt token authorization
const router = express.Router();

router.post("/create-user", userController.createUser);
router.post("/user-login", userController.userSignin);
router.put("/update-score/:id", userController.updateUserScore);
// router.get("/get-all-users",authenicatedUser, userController.getAllUsers);
router.get("/get-all-users", userController.getAllUsers);

router.delete("/delete-user/:id", userController.deleteUser);
router.get("/get-single-user:/id", userController.getSingleUser);
module.exports = router;

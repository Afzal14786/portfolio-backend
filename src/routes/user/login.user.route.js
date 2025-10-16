import express from "express";
const router = express.Router();
import {login, logout, verifyLogin} from "../../controllers/user/login.user.controller.js";


// login routes
router.post("/login", login);
// must verify the otp before login as well as when the user is requesting for update the password at that time as well user have to verify the otp but when user is requesting for reset the password at that time user will received an reset link over the register email id
router.post("/verify-login", verifyLogin);
router.post("/logout", logout);

export default router;
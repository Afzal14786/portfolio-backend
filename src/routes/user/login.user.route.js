import express from "express";
const router = express.Router();
import {login, logout} from "../../controllers/user/login.user.controller.js";


// login routes
router.post("/login", login);
router.post("/logout", logout);

export default router;
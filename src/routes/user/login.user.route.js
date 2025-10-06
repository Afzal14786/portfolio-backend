import express from "express";
const router = express.Router();
import {login} from "../../controllers/user/login.user.controller.js";


// login routes
router.post("/login", login);

export default router;
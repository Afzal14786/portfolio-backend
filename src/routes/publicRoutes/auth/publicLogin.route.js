import express from "express";
import wrapAsync from "../../../middlewares/wrapErr.js";

import {login, verifyLogin, logout} from "../../../controllers/publicUser/auth/publicLogin.controller.js";

const router = express.Router();

router.post("/login", wrapAsync(login));
router.post("/verify", wrapAsync(verifyLogin));
router.post("/logout", wrapAsync(logout));

export default router;
import express from "express";
import {getProfile}from "../../../controllers/admin/profile/getProfileInfo/profile.controller.js";
import { protect } from "../../../middlewares/middleware.auth.js";

const router = express.Router();

router.use(protect);


router.get("/", getProfile);


export default router;
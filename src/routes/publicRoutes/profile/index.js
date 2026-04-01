import express from "express";
const router = express.Router();
import { getPublicProfile } from "../../../controllers/publicUser/profile/getPublicProfile.controller.js";

router.get("/", getPublicProfile);
export default router;
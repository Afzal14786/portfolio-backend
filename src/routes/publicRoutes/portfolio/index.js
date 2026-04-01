import express from "express";
import { getProjects } from "../../../controllers/portfolio/project.controller.js";
import { getSkills } from "../../../controllers/portfolio/skill.controller.js";
import { getJourney } from "../../../controllers/portfolio/journey.controller.js";
import { getCertificates } from "../../../controllers/portfolio/certificate.controller.js";

const router = express.Router();

// Read-only public routes
router.get("/projects", getProjects);
router.get("/skills", getSkills);
router.get("/journey", getJourney);
router.get("/certificates", getCertificates);

export default router;
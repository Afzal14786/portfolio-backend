import express from "express";
import { createProject, getProjects, deleteProject, updateProject } from "../../controllers/portfolio/project.controller.js";
import { createCertificate, getCertificates, deleteCertificate } from "../../controllers/portfolio/certificate.controller.js";
import { createJourneyEvent, getJourney } from "../../controllers/portfolio/journey.controller.js";
import { createSkill, getSkills } from "../../controllers/portfolio/skill.controller.js";

// Assuming you have these middlewares based on your repo structure
import { requireAdmin } from "../../middlewares/middleware.auth.js"; 
import upload from "../../middlewares/upload.js"; 

const router = express.Router();

// ================= PROJECTS =================
router.route("/projects")
  .get(getProjects) // Public access for Visitors
  .post(requireAdmin, upload.single("image"), createProject); // Admin only

router.route("/projects/:id")
  .put(requireAdmin, upload.single("image"), updateProject) // <-- Add this line
  .delete(requireAdmin, deleteProject);

// ================= CERTIFICATES =================
router.route("/certificates")
  .get(getCertificates)
  .post(requireAdmin, upload.single("image"), createCertificate);

router.delete("/certificates/:id", requireAdmin, deleteCertificate);

// ================= JOURNEY =================
router.route("/journey")
  .get(getJourney)
  .post(requireAdmin, createJourneyEvent);

// ================= SKILLS =================
router.route("/skills")
  .get(getSkills)
  .post(requireAdmin, upload.single("icon"), createSkill);

export default router;


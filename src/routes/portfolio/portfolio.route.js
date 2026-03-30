import express from "express";
import { createProject, getProjects, deleteProject, updateProject } from "../../controllers/portfolio/project.controller.js";
import { createCertificate, getCertificates, deleteCertificate, updateCertificate } from "../../controllers/portfolio/certificate.controller.js";
import { createJourneyEvent, getJourney, updateJourneyEvent, deleteJourneyEvent } from "../../controllers/portfolio/journey.controller.js";
import { createSkill, getSkills, deleteSkill, updateSkill } from "../../controllers/portfolio/skill.controller.js";

// Assuming you have these middlewares based on your repo structure
import { protect, requireAdmin } from "../../middlewares/middleware.auth.js";import upload from "../../middlewares/upload.js"; 

const router = express.Router();
// ================= PROJECTS =================
router.route("/projects")
  .get(getProjects)
  .post(protect, requireAdmin, upload.single("image"), createProject);

router.route("/projects/:id")
  .put(protect, requireAdmin, upload.single("image"), updateProject)
  .delete(protect, requireAdmin, deleteProject);

// ================= CERTIFICATES =================
router.route("/certificates")
  .get(getCertificates)
  .post(protect, requireAdmin, upload.fields([
    { name: 'certificateImage', maxCount: 1 }, 
    { name: 'teacherImage', maxCount: 1 }
  ]), createCertificate);

router.route("/certificates/:id")
  .put(protect, requireAdmin, upload.fields([
    { name: 'certificateImage', maxCount: 1 }, 
    { name: 'teacherImage', maxCount: 1 }
  ]), updateCertificate)
  .delete(protect, requireAdmin, deleteCertificate);

// ================= JOURNEY =================
router.route("/journey")
  .get(getJourney)
  .post(protect, requireAdmin, createJourneyEvent);

router.route("/journey/:id")
  .put(protect, requireAdmin, updateJourneyEvent)
  .delete(protect, requireAdmin, deleteJourneyEvent)

// ================= SKILLS =================
router.route("/skills")
  .get(getSkills)
  .post(protect, requireAdmin, upload.single("icon"), createSkill);

router.route("/skills/:id")
  .put(protect, requireAdmin, upload.single("icon"), updateSkill)
  .delete(protect, requireAdmin, deleteSkill);

export default router;


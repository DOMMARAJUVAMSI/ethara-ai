import { Router } from "express";

import {
  addProjectMember,
  createProject,
  getProjects
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireProjectAdmin } from "../middleware/projectAccessMiddleware.js";

const router = Router();

router.use(protect);
router.get("/", getProjects);
router.post("/", createProject);
router.post("/:id/members", requireProjectAdmin, addProjectMember);

export default router;
